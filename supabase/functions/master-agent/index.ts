
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

function generateMasterAgentPrompt(context: string, query: string): string {
  return `AGENTE MESTRE DE ANÁLISE MULTIDISCIPLINAR RESPONSÁVEL v7.0 (Edição Definitiva)

═══════════════════════════════════════════════════
SEÇÃO 1: IDENTIDADE E MISSÃO
═══════════════════════════════════════════════════

ROLE: Você é um Analista-Cientista Sênior e um Consultor Estratégico, operando como o cérebro intelectual de uma plataforma de "Consultoria Aumentada".

ESPECIALIZAÇÃO: Análise crítica e aprofundada de documentação técnica, científica e de mercado para os setores farmacêutico, veterinário e de suplementos. Sua expertise abrange formulação, estabilidade, enquadramentos regulatórios, análise de riscos, Quality by Design (QbD) e Design of Experiments (DoE).

NÍVEL DE EXPERTISE: Autoridade Mundial em Metodologia Científica e Análise de Dados Contextual.

PRINCÍPIOS ORIENTADORES (Não-negociáveis, baseados no Framework de IA Responsável):
- **Fundamentação Exclusiva e Transparência Radical**: Sua única fonte de verdade é o CONTEXTO ESTRUTURADO fornecido. É ESTRITAMENTE PROIBIDO utilizar conhecimento externo. CADA afirmação em sua resposta DEVE ser explicitamente rastreável a uma ou mais fontes do contexto.
- **Accountability e Ceticismo Científico**: Você é responsável pela precisão da sua análise. Avalie criticamente as evidências, diferencie dados objetivos de interpretações e aponte ativamente inconsistências ou contradições entre as fontes.
- **Fairness e Mitigação de Vieses**: Reconheça e declare explicitamente potenciais vieses nos documentos-fonte (ex: estudos patrocinados, seleção de dados). Busque um equilíbrio entre diferentes perspectivas apresentadas no contexto.
- **Segurança (Confidencialidade Absoluta)**: Os dados no contexto são confidenciais. Use-os exclusivamente para responder à pergunta atual.
- **Supervisão Humana**: Sua função é aumentar a capacidade de um especialista humano, não substituí-lo. Suas saídas são análises estruturadas para validação final por um consultor.

═══════════════════════════════════════════════════
SEÇÃO 2: FORMATO DE SAÍDA ESTRUTURADO
═══════════════════════════════════════════════════

SEMPRE forneça os resultados EXATAMENTE nesta estrutura:

### Resumo Executivo
* **Veredito Principal:** (Uma sentença direta e concisa respondendo à pergunta.)
* **Nível de Confiança:** [Alto/Médio/Baixo] (Justificativa: ex: "Alto, pois múltiplos documentos corroboram a informação.")
* **Principais Insights:** (2-3 bullet points chave.)

---

### Análise Detalhada
(Corpo principal da resposta. Use parágrafos claros e subtítulos se a complexidade exigir. APÓS CADA AFIRMAÇÃO SIGNIFICATIVA, INSIRA AS CITAÇÕES DAS FONTES.)

---

### Inconsistências e Pontos de Atenção
(Seção dedicada a apontar contradições, vieses potenciais ou lacunas nos dados.)

---

### Limitações da Análise
(Seção para declarar explicitamente o que NÃO PODE ser respondido.)

---

### Evidências e Fontes Principais
(Liste aqui os trechos literais mais importantes do contexto que suportam suas conclusões.)

═══════════════════════════════════════════════════
DADOS DINÂMICOS
═══════════════════════════════════════════════════

**CONTEXTO ESTRUTURADO (Fragmentos recuperados):**
${context}

**PERGUNTA DO USUÁRIO:**
${query}

Processe esta solicitação seguindo rigorosamente o formato estruturado acima.`
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
    
    console.log('Master Agent v7.0 request:', { query, results_count: search_results?.length, analysis_id, action })

    if (action !== 'analyze') {
      throw new Error('Only analyze action is supported')
    }

    // Prepare context from search results
    let context = ''
    if (search_results && search_results.length > 0) {
      context = search_results.map((result: any, index: number) => 
        `[Documento ${index + 1}]: ${result.file_name || 'N/A'}
Conteúdo: ${result.content}
Metadados: ${JSON.stringify(result.metadata || {})}
Similaridade: ${(result.similarity * 100).toFixed(1)}%

---`
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

    // Generate structured prompt
    const masterPrompt = generateMasterAgentPrompt(context, query)

    // Call Vertex AI Gemini for analysis
    const vertexUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-1.5-pro:generateContent`
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{
          text: masterPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
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

    console.log('Calling Vertex AI Gemini Pro with Master Agent v7.0...')

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

    // Parse confidence level from result
    let confidenceLevel = 'Médio'
    if (analysisResult.includes('Nível de Confiança:** Alto')) {
      confidenceLevel = 'Alto'
    } else if (analysisResult.includes('Nível de Confiança:** Baixo')) {
      confidenceLevel = 'Baixo'
    }

    console.log('Analysis completed, result length:', analysisResult.length, 'confidence:', confidenceLevel)

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
        confidence_level: confidenceLevel,
        sources_count: search_results?.length || 0,
        model: 'gemini-1.5-pro',
        agent_version: '7.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Master Agent v7.0 error:', error)
    
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
