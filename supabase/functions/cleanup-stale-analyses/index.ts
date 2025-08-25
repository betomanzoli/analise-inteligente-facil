
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

    // Find analyses that are stuck in pending/processing and have exceeded timeout
    const { data: staleAnalyses, error: selectError } = await supabase
      .from('analysis_records')
      .select('id, file_name, created_at, processing_timeout')
      .in('status', ['pending', 'processing'])
      .lt('processing_timeout', new Date().toISOString());

    if (selectError) {
      console.error('Error finding stale analyses:', selectError);
      return new Response(
        JSON.stringify({ error: 'Failed to find stale analyses' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${staleAnalyses?.length || 0} stale analyses`);

    if (staleAnalyses && staleAnalyses.length > 0) {
      const staleIds = staleAnalyses.map(a => a.id);
      
      // Update stale analyses to error status
      const { data: updatedAnalyses, error: updateError } = await supabase
        .from('analysis_records')
        .update({
          status: 'error',
          error_message: 'Análise expirou por timeout. O processamento demorou mais que o esperado.',
          updated_at: new Date().toISOString(),
          processing_timeout: null
        })
        .in('id', staleIds)
        .select();

      if (updateError) {
        console.error('Error updating stale analyses:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update stale analyses' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Updated ${updatedAnalyses?.length || 0} stale analyses to error status`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          updated_count: updatedAnalyses?.length || 0,
          updated_analyses: updatedAnalyses?.map(a => ({ id: a.id, file_name: a.file_name }))
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated_count: 0,
        message: 'No stale analyses found'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in cleanup:', error);
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
