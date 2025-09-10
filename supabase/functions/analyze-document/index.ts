
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

    const body = await req.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))

    const { action, analysis_id, query, user_id, contextDocuments } = body

    // Validar parâmetros básicos
    if (!action || !analysis_id) {
      console.error('Missing required parameters:', { action, analysis_id })
      return new Response(
        JSON.stringify({ error: 'Missing action or analysis_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Roteamento baseado na ação
    if (action === 'process') {
      // INGESTÃO NATIVA: Usar novo sistema de processamento
      console.log('Processing ingestion with native system for analysis:', analysis_id)
      
      const { file_path, file_name, instruction, project_name, isBatchUpload } = body

      if (!file_path || !file_name) {
        console.error('Missing file parameters for ingestion')
        return new Response(
          JSON.stringify({ error: 'Missing file_path or file_name for ingestion' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      try {
        // Etapa 1: Extrair texto com OCR avançado
        console.log('Step 1: Extracting text with advanced OCR...')
        
        const ocrResponse = await supabase.functions.invoke('native-document-processor', {
          body: {
            analysis_id,
            file_path,
            action: 'extract_text'
          }
        })

        if (ocrResponse.error) {
          console.error('OCR extraction failed (HTTP error):', ocrResponse.error)
          throw new Error(`OCR failed: ${ocrResponse.error.message}`)
        }

        const ocrData = ocrResponse.data
        if (!ocrData?.success) {
          console.error('OCR extraction returned unsuccessful result:', ocrData)
          await supabase
            .from('analysis_records')
            .update({
              status: 'error',
              error_message: ocrData?.error ? `Falha na extração de texto: ${ocrData.error}` : 'Falha na extração de texto',
              updated_at: new Date().toISOString(),
              processing_timeout: null
            })
            .eq('id', analysis_id)

          return new Response(
            JSON.stringify({
              success: false,
              message: 'OCR extraction failed',
              analysis_id,
              ocr_result: ocrData
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }

        console.log('OCR completed successfully')

        // Etapa 2: Chunking e geração de embeddings
        console.log('Step 2: Chunking and embedding generation...')
        
        const embeddingResponse = await supabase.functions.invoke('native-document-processor', {
          body: {
            analysis_id,
            action: 'chunk_and_embed'
          }
        })

        if (embeddingResponse.error) {
          console.error('Embedding generation failed:', embeddingResponse.error)
          throw new Error(`Embedding failed: ${embeddingResponse.error.message}`)
        }

        console.log('Document processing completed successfully')

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Native ingestion completed successfully',
            analysis_id,
            ocr_result: ocrResponse.data,
            embedding_result: embeddingResponse.data
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      } catch (error) {
        console.error('Native ingestion process failed:', error)
        
        // Atualizar registro com erro
        await supabase
          .from('analysis_records')
          .update({
            status: 'error',
            error_message: `Falha no processamento nativo: ${error.message}`,
            updated_at: new Date().toISOString(),
            processing_timeout: null
          })
          .eq('id', analysis_id)

        throw error
      }

    } else if (action === 'semantic-search') {
      // ANÁLISE IA: Realizar busca semântica e análise com Master Agent v6.0
      console.log('Processing semantic search with Master Agent v6.0 for analysis:', analysis_id)
      
      if (!query) {
        console.error('Missing query for semantic search')
        return new Response(
          JSON.stringify({ error: 'Missing query for semantic search' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      try {
        // Realizar busca semântica
        const searchResponse = await supabase.functions.invoke('semantic-search', {
          body: {
            query: query,
            matchThreshold: 0.6,
            matchCount: 10,
            userId: user_id
          }
        })

        if (searchResponse.error) {
          console.error('Semantic search failed:', searchResponse.error)
          
          // Atualizar registro com erro de busca semântica
          await supabase
            .from('analysis_records')
            .update({
              status: 'error',
              error_message: `Falha na busca semântica: ${searchResponse.error.message}`,
              updated_at: new Date().toISOString(),
              processing_timeout: null
            })
            .eq('id', analysis_id)

          throw new Error('Busca semântica falhou')
        }

        const searchResults = searchResponse.data?.results || []
        console.log(`Found ${searchResults.length} relevant documents`)

        if (searchResults.length === 0) {
          // Atualizar registro indicando que não foram encontrados documentos
          await supabase
            .from('analysis_records')
            .update({
              status: 'completed',
              result: 'Não foram encontrados documentos relevantes para sua consulta. Verifique se há documentos na sua base de conhecimento que possam responder a esta pergunta.',
              updated_at: new Date().toISOString(),
              processing_timeout: null
            })
            .eq('id', analysis_id)

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'No relevant documents found',
              analysis_id,
              results: []
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }

        // Chamar Master Agent v6.0 para análise
        console.log('Calling Master Agent v6.0 for analysis...')
        
        const analysisResponse = await supabase.functions.invoke('master-agent', {
          body: {
            analysis_id,
            query,
            search_results: searchResults,
            user_id,
            context_documents: contextDocuments || [],
            action: 'analyze'
          }
        })

        if (analysisResponse.error) {
          console.error('Master Agent analysis failed:', analysisResponse.error)
          throw new Error(`Análise falhou: ${analysisResponse.error.message}`)
        }

        console.log('Master Agent v6.0 analysis completed successfully')

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Analysis completed with Master Agent v6.0',
            analysis_id,
            results: searchResults,
            analysis_result: analysisResponse.data
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      } catch (error) {
        console.error('Error in semantic analysis process:', error)
        
        // Atualizar registro com erro
        await supabase
          .from('analysis_records')
          .update({
            status: 'error',
            error_message: `Falha na análise com Master Agent v6.0: ${error.message}`,
            updated_at: new Date().toISOString(),
            processing_timeout: null
          })
          .eq('id', analysis_id)

        throw error
      }

    } else {
      console.error('Unknown action:', action)
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in analyze-document function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
