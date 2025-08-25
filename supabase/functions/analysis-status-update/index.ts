
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
    console.log('Analysis status update function called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { analysis_id, status, error_message, result } = await req.json();
    console.log('Received update request:', { analysis_id, status, error_message: !!error_message, result: !!result });

    if (!analysis_id || !status) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing analysis_id or status' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update the analysis record
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (error_message) {
      updateData.error_message = error_message;
    }

    if (result) {
      updateData.result = result;
    }

    if (status === 'completed' || status === 'error') {
      updateData.processing_timeout = null; // Clear timeout when done
    }

    const { data, error } = await supabase
      .from('analysis_records')
      .update(updateData)
      .eq('id', analysis_id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update analysis record', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Analysis record updated successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis_id: data.id,
        status: data.status 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
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
