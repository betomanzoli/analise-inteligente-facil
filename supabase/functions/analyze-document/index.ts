
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Webhooks do Make.com
const WEBHOOKS = {
  INGESTION: 'https://hook.us1.make.com/wnwlxeimcxne33gm1skn1twi4wp14cwb', // Para upload em lote
  ANALYSIS: 'https://hook.us1.make.com/a2wf9rkk9gmwfmfv4jbhoak75b501igd'   // Para análise/busca RAG
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { action, flowType, ...data } = await req.json()
      
      if (action === 'upload') {
        const { fileName, fileSize, instruction } = data
        
        console.log('Creating upload URL for:', fileName)
        
        // Create analysis record
        const { data: analysisRecord, error: dbError } = await supabase
          .from('analysis_records')
          .insert({
            file_name: fileName,
            file_path: `documents/${Date.now()}-${fileName}`,
            file_size: fileSize,
            instruction: instruction,
            status: 'pending'
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          throw new Error('Failed to create analysis record')
        }

        // Generate signed upload URL
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('documents')
          .createSignedUploadUrl(analysisRecord.file_path, {
            upsert: false
          })

        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError)
          throw new Error('Failed to generate upload URL')
        }

        return new Response(
          JSON.stringify({
            success: true,
            uploadUrl: signedUrlData.signedUrl,
            token: signedUrlData.token,
            path: signedUrlData.path,
            analysisId: analysisRecord.id
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      if (action === 'process') {
        const { analysisId, filePath, isBatchUpload = false } = data
        
        console.log('Processing analysis:', analysisId, 'Batch upload:', isBatchUpload)
        
        // Update status to processing
        await supabase
          .from('analysis_records')
          .update({ status: 'processing' })
          .eq('id', analysisId)

        // Get analysis record details
        const { data: analysisRecord } = await supabase
          .from('analysis_records')
          .select('*')
          .eq('id', analysisId)
          .single()

        if (!analysisRecord) {
          throw new Error('Analysis record not found')
        }

        // Get download URL for the uploaded file
        const { data: downloadData } = await supabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600) // 1 hour expiry

        if (!downloadData?.signedUrl) {
          throw new Error('Failed to generate download URL')
        }

        // Determine which webhook to call based on the flow type
        const webhookUrl = isBatchUpload ? WEBHOOKS.INGESTION : WEBHOOKS.ANALYSIS
        
        console.log(`Calling ${isBatchUpload ? 'INGESTION' : 'ANALYSIS'} webhook:`, webhookUrl)

        const webhookPayload = {
          analysisId: analysisId,
          fileName: analysisRecord.file_name,
          fileUrl: downloadData.signedUrl,
          instruction: analysisRecord.instruction,
          callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-document`,
          flowType: isBatchUpload ? 'ingestion' : 'analysis',
          projectName: analysisRecord.project_name || null,
          batchId: analysisRecord.batch_id || null
        }

        console.log('Calling Make.com webhook with payload:', webhookPayload)

        try {
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
          })

          if (!webhookResponse.ok) {
            throw new Error(`Make.com webhook failed: ${webhookResponse.status}`)
          }

          console.log(`Make.com ${isBatchUpload ? 'INGESTION' : 'ANALYSIS'} webhook called successfully`)

        } catch (webhookError) {
          console.error('Make.com webhook error:', webhookError)
          
          // Update status to error if webhook fails
          await supabase
            .from('analysis_records')
            .update({ 
              status: 'error',
              error_message: `Webhook error: ${webhookError.message}`
            })
            .eq('id', analysisId)

          throw new Error('Failed to call Make.com webhook')
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `${isBatchUpload ? 'Ingestão' : 'Análise'} started`,
            analysisId: analysisId,
            flowType: isBatchUpload ? 'ingestion' : 'analysis'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      if (action === 'semantic-search') {
        const { query, userId, projectId } = data
        
        console.log('Processing semantic search query:', query)

        // Call the ANALYSIS webhook for semantic search queries
        const webhookPayload = {
          query: query,
          userId: userId,
          projectId: projectId,
          callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-document`,
          flowType: 'semantic-search'
        }

        console.log('Calling ANALYSIS webhook for semantic search:', webhookPayload)

        try {
          const webhookResponse = await fetch(WEBHOOKS.ANALYSIS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
          })

          if (!webhookResponse.ok) {
            throw new Error(`Semantic search webhook failed: ${webhookResponse.status}`)
          }

          console.log('Semantic search webhook called successfully')

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Busca semântica iniciada',
              query: query
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )

        } catch (webhookError) {
          console.error('Semantic search webhook error:', webhookError)
          throw new Error('Failed to call semantic search webhook')
        }
      }

      if (action === 'status') {
        const { analysisId } = data
        
        const { data: analysisRecord } = await supabase
          .from('analysis_records')
          .select('*')
          .eq('id', analysisId)
          .single()

        return new Response(
          JSON.stringify({
            success: true,
            analysis: analysisRecord
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // Handle Make.com callback (webhook from Make.com with results)
    if (req.method === 'PUT') {
      const { analysisId, result, error, flowType } = await req.json()
      
      console.log(`Received callback from Make.com for ${flowType || 'analysis'}:`, analysisId)
      
      if (error) {
        await supabase
          .from('analysis_records')
          .update({ 
            status: 'error',
            error_message: error
          })
          .eq('id', analysisId)
      } else {
        await supabase
          .from('analysis_records')
          .update({ 
            status: 'completed',
            result: result
          })
          .eq('id', analysisId)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
