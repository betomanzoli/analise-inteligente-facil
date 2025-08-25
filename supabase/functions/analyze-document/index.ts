
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
      // INGESTÃO: Chamar webhook do Make para processamento de documentos
      console.log('Processing ingestion for analysis:', analysis_id)
      
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

      // Chamar webhook do Make para ingestão
      const makeWebhookUrl = 'https://hook.eu2.make.com/oi8bg37akj7fp2wn2ugu91bj7fex221a'
      
      const webhookPayload = {
        analysis_id,
        file_path,
        file_name,
        instruction: instruction || 'Indexar documento para busca semântica',
        user_id,
        project_name,
        is_batch_upload: isBatchUpload || false,
        action: 'INGESTION'
      }

      console.log('Calling Make webhook for ingestion:', webhookPayload)

      const makeResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!makeResponse.ok) {
        console.error('Make webhook failed:', makeResponse.status, makeResponse.statusText)
        
        // Atualizar registro com erro
        await supabase
          .from('analysis_records')
          .update({
            status: 'error',
            error_message: `Falha na comunicação com o webhook: ${makeResponse.statusText}`,
            updated_at: new Date().toISOString(),
            processing_timeout: null
          })
          .eq('id', analysis_id)

        throw new Error('Webhook de ingestão falhou')
      }

      console.log('Make webhook called successfully for ingestion')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Ingestion started successfully',
          analysis_id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } else if (action === 'semantic-search') {
      // ANÁLISE IA: Realizar busca semântica e análise
      console.log('Processing semantic search for analysis:', analysis_id)
      
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
        
        // Atualizar registro com erro
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

      // Chamar webhook do Make para análise IA
      const analysisWebhookUrl = 'https://hook.eu2.make.com/2rwkvbsd61j7f72dbet2mu4tpd7wwlrm'
      
      const analysisPayload = {
        analysis_id,
        query,
        search_results: searchResults,
        user_id,
        context_documents: contextDocuments || [],
        action: 'ANALYSIS'
      }

      console.log('Calling Make webhook for AI analysis:', analysisPayload)

      const analysisResponse = await fetch(analysisWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisPayload),
      })

      if (!analysisResponse.ok) {
        console.error('Analysis webhook failed:', analysisResponse.status, analysisResponse.statusText)
        
        // Atualizar registro com erro
        await supabase
          .from('analysis_records')
          .update({
            status: 'error',
            error_message: `Falha na comunicação com o webhook de análise: ${analysisResponse.statusText}`,
            updated_at: new Date().toISOString(),
            processing_timeout: null
          })
          .eq('id', analysis_id)

        throw new Error('Webhook de análise falhou')
      }

      console.log('Analysis webhook called successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Analysis started successfully',
          analysis_id,
          results: searchResults
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

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
