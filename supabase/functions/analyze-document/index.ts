
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      const { action, ...data } = await req.json()
      
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
        const { analysisId, filePath } = data
        
        console.log('Processing analysis:', analysisId)
        
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

        // Call n8n webhook (placeholder - you'll need to provide the actual webhook URL)
        const makeWebhookUrl = 'https://hook.us1.make.com/a2wf9rkk9gmwfmfv4jbhoak75b501igd' // Replace with actual webhook URL
        
        const webhookPayload = {
          analysisId: analysisId,
          fileName: analysisRecord.file_name,
          fileUrl: downloadData.signedUrl,
          instruction: analysisRecord.instruction,
          callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-document`
        }

        console.log('Calling n8n webhook with payload:', webhookPayload)

        // For now, simulate the n8n call with a timeout
        // Replace this with actual webhook call:
        // const webhookResponse = await fetch(n8nWebhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(webhookPayload)
        // })

        // Simulate processing time and return mock result
        setTimeout(async () => {
          const mockResult = `RELATÓRIO DE ANÁLISE - ${analysisRecord.file_name}
═══════════════════════════════════════════════════

INSTRUÇÃO RECEBIDA:
${analysisRecord.instruction}

RESUMO EXECUTIVO:
Este documento foi processado com sucesso pela nossa IA avançada.

PRINCIPAIS INSIGHTS:
• Documento analisado com ${Math.floor(Math.random() * 50 + 10)} páginas
• Identificados ${Math.floor(Math.random() * 20 + 5)} pontos principais  
• Nível de complexidade: ${['Baixo', 'Médio', 'Alto'][Math.floor(Math.random() * 3)]}
• Conformidade regulatória: Verificada

RECOMENDAÇÕES ESTRATÉGICAS:
1. Revisar as seções destacadas para melhor compreensão
2. Implementar as sugestões identificadas no documento
3. Acompanhar os próximos passos recomendados
4. Validar com equipe técnica especializada

CONCLUSÃO:
A análise foi concluída com sucesso. Os insights gerados seguem as melhores práticas do setor e podem ser utilizados para tomada de decisões estratégicas.

═══════════════════════════════════════════════════
Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`

          await supabase
            .from('analysis_records')
            .update({ 
              status: 'completed',
              result: mockResult,
              n8n_execution_id: `mock_${Date.now()}`
            })
            .eq('id', analysisId)
        }, 5000) // 5 second delay for demo

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Analysis started',
            analysisId: analysisId
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
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

    // Handle n8n callback (webhook from n8n with results)
    if (req.method === 'PUT') {
      const { analysisId, result, error } = await req.json()
      
      console.log('Received callback from n8n for analysis:', analysisId)
      
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
