
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Cleanup stale analyses function called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find analyses that are stuck in pending/processing state for more than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: staleAnalyses, error: selectError } = await supabase
      .from('analysis_records')
      .select('id, file_name, created_at, status')
      .in('status', ['pending', 'processing'])
      .lt('created_at', fifteenMinutesAgo);

    if (selectError) {
      console.error('Error finding stale analyses:', selectError);
      throw new Error('Failed to query stale analyses');
    }

    console.log(`Found ${staleAnalyses?.length || 0} stale analyses`);

    if (!staleAnalyses || staleAnalyses.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No stale analyses found',
          updated_count: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update stale analyses to error status
    const staleIds = staleAnalyses.map(analysis => analysis.id);
    
    const { error: updateError } = await supabase
      .from('analysis_records')
      .update({
        status: 'error',
        error_message: 'Processamento interrompido por timeout. Tente novamente.',
        updated_at: new Date().toISOString(),
        processing_timeout: null
      })
      .in('id', staleIds);

    if (updateError) {
      console.error('Error updating stale analyses:', updateError);
      throw new Error('Failed to update stale analyses');
    }

    console.log(`Successfully marked ${staleAnalyses.length} analyses as failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Marked ${staleAnalyses.length} stale analyses as failed`,
        updated_count: staleAnalyses.length,
        updated_ids: staleIds
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in cleanup function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
