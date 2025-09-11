import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpecializedAnalysisRequest {
  analysisId: string
  documentType: string
  analysisType: string
  fileContent: string
  fileName: string
}

function generateSpecializedPrompt(analysisType: string, documentType: string, content: string, fileName: string): string {
  const baseContext = `
DOCUMENTO: ${fileName}
TIPO DETECTADO: ${documentType}
CONTEÚDO: ${content}
`

  const prompts: Record<string, string> = {
    'regulatory-compliance': `
ESPECIALISTA EM ANÁLISE REGULATÓRIA FARMACÊUTICA v2.0

Você é um consultor regulatório sênior especializado em ANVISA, FDA e EMA.

MISSÃO: Realizar análise profissional de compliance regulatório baseada exclusivamente no documento fornecido.

FORMATO DE SAÍDA OBRIGATÓRIO:
### Resumo Executivo
**Veredito Principal:** [Sentença direta sobre o status regulatório]
**Nível de Confiança:** [Alto/Médio/Baixo] - [Justificativa]
**Principais Insights:**
• [Insight 1]
• [Insight 2] 
• [Insight 3]

### Análise Regulatória Detalhada
**Status de Compliance ANVISA:**
- [Análise específica com base nas RDCs aplicáveis]

**Gaps Identificados:**
- [Gap 1 com referência normativa]
- [Gap 2 com referência normativa]

**Timeline Estimado para Regularização:**
- [Estimativa baseada nos gaps encontrados]

### Recomendações Prioritárias
**Ações Imediatas (0-30 dias):**
• [Ação específica com justificativa]

**Prazo Curto (1-6 meses):**
• [Ação específica com justificativa]

**Prazo Longo (6+ meses):**
• [Ação específica com justificativa]

### Avaliação de Riscos
**Riscos Alto:** [Lista específica]
**Riscos Médio:** [Lista específica]
**Riscos Baixo:** [Lista específica]

**CONTEXTO:** ${baseContext}
`,

    'formulation-optimization': `
ESPECIALISTA EM FORMULAÇÃO FARMACÊUTICA v2.0

Você é um farmacêutico formulador sênior com 15+ anos de experiência.

MISSÃO: Analisar formulação e identificar oportunidades de otimização.

FORMATO DE SAÍDA OBRIGATÓRIO:
### Resumo Executivo
**Veredito Principal:** [Avaliação geral da formulação]
**Nível de Confiança:** [Alto/Médio/Baixo] - [Justificativa]
**Principais Insights:**
• [Insight sobre excipientes]
• [Insight sobre compatibilidade]
• [Insight sobre estabilidade]

### Análise de Formulação
**Excipientes Analisados:**
- [Excipiente]: [Função] - [Avaliação]

**Compatibilidade Farmacêutica:**
- [Análise de interações conhecidas]

**Oportunidades de Otimização:**
- [Sugestão específica com justificativa científica]

### Recomendações Técnicas
**Melhorias Sugeridas:**
• [Melhoria 1 com base científica]
• [Melhoria 2 com base científica]

**Estudos Recomendados:**
• [Estudo específico e justificativa]

**CONTEXTO:** ${baseContext}
`,

    'costing-analysis': `
ESPECIALISTA EM CUSTEIO FARMACÊUTICO v2.0

Você é um analista financeiro especializado no setor farmacêutico.

MISSÃO: Analisar estrutura de custos e precificação.

FORMATO DE SAÍDA OBRIGATÓRIO:
### Resumo Executivo
**Veredito Principal:** [Avaliação da estrutura de custos]
**Nível de Confiança:** [Alto/Médio/Baixo] - [Justificativa]
**Principais Insights:**
• [Insight sobre custos]
• [Insight sobre margem]
• [Insight sobre competitividade]

### Análise de Custos
**Breakdown de Custos Identificados:**
- Matéria-Prima: [% e análise]
- Embalagem: [% e análise]
- Regulatório: [% e análise]

**Análise de Margem:**
- [Avaliação da margem atual vs mercado]

**Benchmarking de Mercado:**
- [Comparação com similares quando aplicável]

### Recomendações Financeiras
**Otimizações de Custo:**
• [Sugestão específica com impacto estimado]

**Estratégia de Precificação:**
• [Recomendação baseada na análise]

**CONTEXTO:** ${baseContext}
`,

    'literature-extraction': `
ESPECIALISTA EM LITERATURA CIENTÍFICA v2.0

Você é um pesquisador científico sênior especializado em ciências farmacêuticas.

MISSÃO: Extrair insights científicos relevantes para tomada de decisão.

FORMATO DE SAÍDA OBRIGATÓRIO:
### Resumo Executivo
**Veredito Principal:** [Síntese dos principais achados científicos]
**Nível de Confiança:** [Alto/Médio/Baixo] - [Justificativa]
**Principais Insights:**
• [Insight científico 1]
• [Insight científico 2]
• [Insight científico 3]

### Análise Científica
**Evidências Principais:**
- [Evidência com nível de evidência científica]

**Gaps de Conhecimento Identificados:**
- [Gap específico e implicações]

**Relevância Clínica/Regulatória:**
- [Análise da aplicabilidade prática]

### Recomendações de Pesquisa
**Estudos Adicionais Recomendados:**
• [Tipo de estudo e justificativa]

**Aplicações Práticas:**
• [Como aplicar os achados]

**CONTEXTO:** ${baseContext}
`,

    'equivalence-analysis': `
ESPECIALISTA EM EQUIVALÊNCIA FARMACÊUTICA v2.0

Você é um especialista em estudos de bioequivalência e equivalência farmacêutica.

MISSÃO: Analisar equivalência vs medicamento de referência.

FORMATO DE SAÍDA OBRIGATÓRIO:
### Resumo Executivo
**Veredito Principal:** [Avaliação da equivalência]
**Nível de Confiança:** [Alto/Médio/Baixo] - [Justificativa]
**Principais Insights:**
• [Insight sobre equivalência]
• [Insight sobre bioequivalência]
• [Insight sobre riscos]

### Análise de Equivalência
**Comparação vs Referência:**
- [Análise comparativa detalhada]

**Perfil de Dissolução:**
- [Avaliação quando aplicável]

**Bioequivalência Estimada:**
- [Análise baseada na formulação]

### Recomendações Regulatórias
**Estudos Necessários:**
• [Estudo específico e justificativa regulatória]

**Estratégia Regulatória:**
• [Recomendação de approach regulatório]

**CONTEXTO:** ${baseContext}
`,

    'comprehensive-analysis': `
CONSULTOR FARMACÊUTICO SÊNIOR - ANÁLISE 360° v2.0

Você é um consultor farmacêutico com expertise multidisciplinar.

MISSÃO: Realizar análise abrangente cobrindo aspectos regulatórios, técnicos e comerciais.

FORMATO DE SAÍDA OBRIGATÓRIO:
### Resumo Executivo
**Veredito Principal:** [Síntese geral multidimensional]
**Nível de Confiança:** [Alto/Médio/Baixo] - [Justificativa]
**Principais Insights:**
• [Insight regulatório]
• [Insight técnico]
• [Insight comercial]

### Análise Multidimensional

**Aspecto Regulatório:**
- [Análise de compliance e gaps]

**Aspecto Técnico:**
- [Análise de formulação e qualidade]

**Aspecto Comercial:**
- [Análise de viabilidade e mercado]

### Plano de Ação Integrado
**Roadmap Recomendado:**
1. [Passo 1 com timeline]
2. [Passo 2 com timeline]
3. [Passo 3 com timeline]

**Investimentos Prioritários:**
• [Área de investimento com justificativa ROI]

**CONTEXTO:** ${baseContext}
`
  }

  return prompts[analysisType] || prompts['comprehensive-analysis']
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

    const { analysisId, documentType, analysisType, fileContent, fileName }: SpecializedAnalysisRequest = await req.json()
    
    console.log('Specialized Document Processor v2.0:', { 
      analysisId, 
      documentType, 
      analysisType, 
      fileName,
      contentLength: fileContent.length 
    })

    // Update analysis status
    await supabase
      .from('analysis_records')
      .update({
        status: 'processing_analysis',
        updated_at: new Date().toISOString()
      })
      .eq('id', analysisId)

    // Generate specialized prompt
    const specializedPrompt = generateSpecializedPrompt(analysisType, documentType, fileContent, fileName)
    
    // Get Google Cloud access token
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountKey) {
      throw new Error('Google Service Account Key not configured')
    }

    const serviceAccount = JSON.parse(serviceAccountKey)
    
    // Create JWT for authentication (simplified)
    const header = btoa(JSON.stringify({
      alg: 'RS256',
      typ: 'JWT',
      kid: serviceAccount.private_key_id
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    const now = Math.floor(Date.now() / 1000)
    const payload = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    // Get access token (simplified for demo)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${payload}.signature`
    })

    let accessToken: string
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json()
      accessToken = tokenData.access_token
    } else {
      // Fallback: use direct API key if available
      accessToken = Deno.env.get('GOOGLE_VISION_API_KEY') ?? ''
    }

    // Call Vertex AI Gemini for specialized analysis
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    const region = Deno.env.get('GOOGLE_CLOUD_REGION') || 'us-central1'
    
    if (!projectId) {
      throw new Error('Google Cloud Project ID not configured')
    }

    const vertexUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-1.5-pro:generateContent`
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{
          text: specializedPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    }

    console.log('Calling Vertex AI Gemini Pro for specialized analysis...')

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

    // Parse confidence level
    let confidenceLevel = 'Médio'
    if (analysisResult.includes('Nível de Confiança:** Alto')) {
      confidenceLevel = 'Alto'
    } else if (analysisResult.includes('Nível de Confiança:** Baixo')) {
      confidenceLevel = 'Baixo'
    }

    console.log('Specialized analysis completed:', {
      analysisId,
      analysisType,
      resultLength: analysisResult.length,
      confidence: confidenceLevel
    })

    // Update analysis record with specialized result
    await supabase
      .from('analysis_records')
      .update({
        result: analysisResult,
        status: 'completed',
        updated_at: new Date().toISOString(),
        processing_timeout: null,
        metadata: {
          analysisType,
          documentType,
          confidenceLevel,
          specializedProcessor: 'v2.0'
        }
      })
      .eq('id', analysisId)

    return new Response(
      JSON.stringify({ 
        success: true,
        result: analysisResult,
        analysisId,
        analysisType,
        confidenceLevel,
        model: 'gemini-1.5-pro',
        processor: 'specialized-v2.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Specialized Document Processor error:', error)
    
    // Try to get analysis ID from request for error logging
    let analysisId: string | null = null
    try {
      const body = await req.json()
      analysisId = body.analysisId
    } catch {}
    
    if (analysisId) {
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
        .eq('id', analysisId)
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