
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { analysis_id, file_path, action } = await req.json()
    
    console.log('Native processor request:', { analysis_id, file_path, action })

    if (action === 'extract_text') {
      // Download PDF from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(file_path)

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`)
      }

      // Check file size (limit to 10MB for OCR processing)
      const arrayBuffer = await fileData.arrayBuffer()
      const fileSizeInMB = arrayBuffer.byteLength / (1024 * 1024)
      
      if (fileSizeInMB > 10) {
        throw new Error(`File too large for OCR processing. Maximum size: 10MB, current: ${fileSizeInMB.toFixed(1)}MB`)
      }

      console.log(`Processing file of size: ${fileSizeInMB.toFixed(2)}MB`)

      // Convert PDF to base64 for Google Vision API (chunk-based approach for large files)
      function arrayBufferToBase64(buffer: ArrayBuffer): string {
        const uint8Array = new Uint8Array(buffer)
        const chunkSize = 1024 * 1024 // 1MB chunks
        let base64String = ''
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize)
          const chunkString = String.fromCharCode.apply(null, Array.from(chunk))
          base64String += btoa(chunkString)
        }
        
        return base64String
      }

      const base64Content = arrayBufferToBase64(arrayBuffer)

      // Call Google Vision API for OCR
      const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
      if (!visionApiKey) {
        throw new Error('Google Vision API key not configured')
      }

      const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Content
            },
            features: [{
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }]
          }]
        })
      })

      if (!visionResponse.ok) {
        throw new Error(`Vision API error: ${visionResponse.status}`)
      }

      const visionData = await visionResponse.json()
      
      if (!visionData.responses?.[0]?.fullTextAnnotation?.text) {
        throw new Error('No text found in document')
      }

      const extractedText = visionData.responses[0].fullTextAnnotation.text
      console.log('Extracted text length:', extractedText.length)

      // Update analysis record with extracted text
      await supabase
        .from('analysis_records')
        .update({
          result: extractedText,
          status: 'text_extracted',
          updated_at: new Date().toISOString()
        })
        .eq('id', analysis_id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          text_length: extractedText.length,
          analysis_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'chunk_and_embed') {
      // Get the extracted text from analysis record
      const { data: record, error: recordError } = await supabase
        .from('analysis_records')
        .select('result, user_id, file_name')
        .eq('id', analysis_id)
        .single()

      if (recordError || !record) {
        throw new Error('Analysis record not found')
      }

      const text = record.result
      if (!text) {
        throw new Error('No extracted text found')
      }

      // Split text into chunks (1000 chars with 200 overlap)
      const chunkSize = 1000
      const overlap = 200
      const chunks = []
      
      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize)
        if (chunk.trim()) {
          chunks.push({
            content: chunk.trim(),
            chunk_index: chunks.length
          })
        }
      }

      console.log(`Created ${chunks.length} chunks for document`)

      // Generate embeddings for each chunk using our generate-embedding function
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        // Generate embedding
        const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
          body: { text: chunk.content }
        })

        if (embeddingResponse.error) {
          console.error('Embedding generation failed for chunk', i, embeddingResponse.error)
          continue
        }

        const embeddingData = embeddingResponse.data
        if (!embeddingData?.success || !embeddingData?.embedding) {
          console.error('Invalid embedding response for chunk', i)
          continue
        }

        // Store chunk with embedding in document_chunks table
        const { error: chunkError } = await supabase
          .from('document_chunks')
          .insert({
            analysis_record_id: analysis_id,
            content: chunk.content,
            chunk_index: chunk.chunk_index,
            embedding: embeddingData.embedding,
            user_id: record.user_id,
            metadata: {
              file_name: record.file_name,
              chunk_size: chunk.content.length,
              total_chunks: chunks.length
            }
          })

        if (chunkError) {
          console.error('Failed to store chunk', i, chunkError)
        }
      }

      // Update analysis record status
      await supabase
        .from('analysis_records')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', analysis_id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          chunks_created: chunks.length,
          analysis_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Native processor error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
