
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Generating embedding for text:', text.substring(0, 100) + '...')

    // Get environment variables for Vertex AI
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    const region = Deno.env.get('GOOGLE_CLOUD_REGION') || 'us-central1'
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')

    if (!projectId || !serviceAccountKey) {
      throw new Error('Missing required Google Cloud configuration')
    }

    // Parse the service account key
    const serviceAccount = JSON.parse(serviceAccountKey)

    // Create JWT for Google Cloud authentication
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: serviceAccount.private_key_id
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    // Import the private key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(
        serviceAccount.private_key
          .replace(/-----BEGIN PRIVATE KEY-----/, '')
          .replace(/-----END PRIVATE KEY-----/, '')
          .replace(/\n/g, '')
      ),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    // Create JWT
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const dataToSign = headerB64 + '.' + payloadB64

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(dataToSign)
    )

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

    const jwt = dataToSign + '.' + signatureB64

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange error:', error)
      throw new Error('Failed to authenticate with Google Cloud')
    }

    const { access_token } = await tokenResponse.json()

    // Call Vertex AI Text Embeddings API
    const vertexUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/text-embedding-004:predict`

    const vertexResponse = await fetch(vertexUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            content: text,
            task_type: 'RETRIEVAL_DOCUMENT'
          }
        ]
      }),
    })

    if (!vertexResponse.ok) {
      const error = await vertexResponse.text()
      console.error('Vertex AI API error:', error)
      throw new Error(`Vertex AI API error: ${vertexResponse.status}`)
    }

    const data = await vertexResponse.json()
    
    if (!data.predictions || !data.predictions[0] || !data.predictions[0].embeddings) {
      throw new Error('Invalid response from Vertex AI')
    }

    const embedding = data.predictions[0].embeddings.values

    console.log('Successfully generated embedding with', embedding.length, 'dimensions')

    return new Response(
      JSON.stringify({ 
        success: true, 
        embedding: embedding,
        dimensions: embedding.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Generate embedding error:', error)
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
