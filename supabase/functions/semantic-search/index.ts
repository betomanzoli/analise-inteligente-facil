
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

    const { query, matchThreshold = 0.7, matchCount = 10, userId } = await req.json()

    if (!query) {
      throw new Error('Query is required')
    }

    console.log('Performing semantic search for:', query)

    // First, generate embedding for the search query
    const embeddingResponse = await supabase.functions.invoke('generate-embedding', {
      body: { text: query }
    })

    if (embeddingResponse.error) {
      console.error('Embedding generation error:', embeddingResponse.error)
      throw new Error('Failed to generate embedding for query')
    }

    const embeddingData = embeddingResponse.data
    if (!embeddingData.success || !embeddingData.embedding) {
      throw new Error('Invalid embedding response')
    }

    const embedding = embeddingData.embedding

    console.log('Generated query embedding, performing vector search...')

    // Perform vector similarity search
    const { data: searchResults, error } = await supabase.rpc('search_similar_chunks', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_user_id: userId
    })

    if (error) {
      console.error('Vector search error:', error)
      throw new Error('Vector search failed')
    }

    console.log('Found', searchResults?.length || 0, 'similar chunks')

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: searchResults || [],
        query: query,
        matchCount: searchResults?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Semantic search error:', error)
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
