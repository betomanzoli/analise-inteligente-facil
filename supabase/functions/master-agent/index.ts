
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleCloudAuth {
  access_token: string
}

async function getGoogleCloudAccessToken(): Promise<string> {
  const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
  if (!serviceAccountKey) {
    throw new Error('Google Service Account Key not configured')
  }

  const serviceAccount = JSON.parse(serviceAccountKey)
  
  // Create JWT for authentication
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
  
  // Create signature (simplified for demo - in production use proper crypto library)
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const dataToSign = headerB64 + '.' + payloadB64
  
  // Import private key
  const pemKey = serviceAccount.private_key
  const binaryKey = atob(pemKey.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\n/g, ''))
  const keyArray = new Uint8Array(binaryKey.length)
  for (let i = 0; i < binaryKey.length; i++) {
    keyArray[i] = binaryKey.charCodeAt(i)
  }
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyArray,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )
  
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
    throw new Error('Failed to authenticate with Google Cloud')
  }
  
  const { access_token } = await tokenResponse.json()
  return access_token
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

    const { query, search_results, analysis_id, action } = await req.json()
    
    console.log('Master Agent v6.0 request:', { query, results_count: search_results?.length, analysis_id, action })

    if (action !== 'analyze') {
      throw new Error('Only analyze action is supported')
    }

    // Prepare context from search results
    let context = ''
    if (search_results && search_results.length > 0) {
      context = search_results.map((result: any, index: number) => 
        `[Documento ${index + 1}]: ${result.content}`
      ).join('\n\n')
    }

    // Get Google Cloud access token
    const accessToken = await getGoogleCloudAccessToken()
    
    // Get environment variables
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    const region = Deno.env.get('GOOGLE_CLOUD_REGION') || 'us-central1'
    
    if (!projectId) {
      throw new Error('Google Cloud Project ID not configured')
    }

    // Call Vertex AI Gemini for analysis
    const vertexUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-1.5-pro:generateContent`
    
    const systemPrompt = `Você é o Master Agent v6.0, um assistente de análise documental avançado especializado em extrair insights precisos e relevantes de documentos corporativos.

SUAS CAPACIDADES:
- Análise semântica profunda de conteúdo
- Extração de insights estratégicos
- Síntese de informações complexas
- Formatação clara e estruturada
- Respostas em português brasileiro

DIRETRIZES DE ANÁLISE:
1. PRECISÃO: Base suas respostas exclusivamente no conteúdo fornecido
2. ESTRUTURA: Organize informações de forma hierárquica e clara
3. RELEVÂNCIA: Foque nos pontos mais importantes para a consulta
4. CONTEXTUALIZAÇÃO: Conecte informações de diferentes partes do documento
5. ACIONABILIDADE: Forneça insights que possam orientar decisões

FORMATO DE RESPOSTA:
- Use títulos e subtítulos claros
- Estruture em seções lógicas
- Destaque pontos-chave com bullet points
- Inclua citações relevantes quando apropriado
- Termine com um resumo executivo quando aplicável

Agora analise o contexto fornecido e responda à consulta de forma completa e precisa.`

    const userMessage = context 
      ? `CONSULTA: ${query}\n\nCONTEXTO DOS DOCUMENTOS:\n${context}`
      : `CONSULTA: ${query}\n\nNenhum documento relevante foi encontrado na base de conhecimento. Forneça uma resposta geral baseada no conhecimento sobre o tópico.`

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{
          text: `${systemPrompt}\n\n${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    }

    console.log('Calling Vertex AI Gemini...')

    const vertexResponse = await fetch(vertexUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!vertexResponse.ok) {
      const errorText = await vertexResponse.text()
      console.error('Vertex AI error:', vertexResponse.status, errorText)
      throw new Error(`Vertex AI API error: ${vertexResponse.status}`)
    }

    const data = await vertexResponse.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Vertex AI')
    }

    const analysisResult = data.candidates[0].content.parts[0].text

    console.log('Analysis completed, result length:', analysisResult.length)

    // Update analysis record with result
    await supabase
      .from('analysis_records')
      .update({
        result: analysisResult,
        status: 'completed',
        updated_at: new Date().toISOString(),
        processing_timeout: null
      })
      .eq('id', analysis_id)

    return new Response(
      JSON.stringify({ 
        success: true,
        result: analysisResult,
        analysis_id,
        model: 'gemini-1.5-pro',
        agent_version: '6.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Master Agent error:', error)
    
    // Update analysis record with error if analysis_id is available
    const body = await req.json().catch(() => ({}))
    if (body.analysis_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase
        .from('analysis_records')
        .update({
          status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString(),
          processing_timeout: null
        })
        .eq('id', body.analysis_id)
    }

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
