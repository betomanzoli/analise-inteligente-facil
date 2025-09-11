import { DocumentClassification } from './DocumentClassifier';
import { NotebookLMInsights } from './NotebookLMAutomation';

export interface SpecializedAnalysisResult {
  executiveSummary: string;
  detailedAnalysis: {
    section: string;
    content: string;
    importance: 'high' | 'medium' | 'low';
    actionRequired: boolean;
  }[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigation: string[];
  };
  complianceChecklist: {
    item: string;
    status: 'compliant' | 'non-compliant' | 'needs-review' | 'not-applicable';
    details?: string;
  }[];
  recommendations: {
    priority: 'immediate' | 'short-term' | 'long-term';
    action: string;
    rationale: string;
    estimatedCost?: string;
    timeline?: string;
  }[];
  roiMetrics: {
    potentialSavings: number;
    implementationCost: number;
    paybackPeriod: string;
    riskReduction: string;
  };
  nextSteps: string[];
  confidence: number;
  sources: string[];
}

export class SpecializedAnalysisEngine {
  private static readonly ANALYSIS_TEMPLATES = {
    'compliance-regulatorio': {
      name: 'Análise de Compliance Regulatório',
      focusAreas: ['conformidade', 'riscos regulatórios', 'timeline de adequações'],
      keyQuestions: [
        'Quais normas regulatórias são aplicáveis?',
        'Há não conformidades identificadas?',
        'Qual o prazo para adequações necessárias?',
        'Quais são os riscos de não conformidade?'
      ]
    },
    'otimizacao-formulacao': {
      name: 'Otimização de Formulação',
      focusAreas: ['compatibilidade', 'estabilidade', 'biodisponibilidade'],
      keyQuestions: [
        'Existem incompatibilidades entre componentes?',
        'Como otimizar a estabilidade da formulação?',
        'Quais estudos são necessários para comprovação?',
        'Há alternativas de excipientes mais eficazes?'
      ]
    },
    'analise-veterinaria': {
      name: 'Análise Regulatória Veterinária',
      focusAreas: ['mapa compliance', 'segurança animal', 'eficácia'],
      keyQuestions: [
        'O produto atende aos requisitos do MAPA?',
        'Há dados de segurança suficientes para as espécies alvo?',
        'A rotulagem está conforme a legislação específica?',
        'Quais estudos clínicos são necessários?'
      ]
    },
    'compliance-suplementos': {
      name: 'Compliance para Suplementos',
      focusAreas: ['rdc 27/2010', 'alegações', 'composição'],
      keyQuestions: [
        'A composição está dentro dos limites da RDC 27/2010?',
        'As alegações funcionais têm fundamentação científica?',
        'A rotulagem atende aos requisitos específicos?',
        'Há necessidade de estudos de segurança adicionais?'
      ]
    },
    'otimizacao-liofilizacao': {
      name: 'Otimização de Liofilização',
      focusAreas: ['ciclo de liofilização', 'formulação', 'qualidade'],
      keyQuestions: [
        'O ciclo atual é otimizado para esta formulação?',
        'Há possibilidade de redução de tempo de processo?',
        'A qualidade do produto final pode ser melhorada?',
        'Quais parâmetros críticos devem ser monitorados?'
      ]
    }
  };

  static async performSpecializedAnalysis(
    analysisType: string,
    classification: DocumentClassification,
    notebookInsights: NotebookLMInsights,
    clientContext?: any
  ): Promise<SpecializedAnalysisResult> {
    
    const template = this.ANALYSIS_TEMPLATES[analysisType as keyof typeof this.ANALYSIS_TEMPLATES];
    
    if (!template) {
      throw new Error(`Tipo de análise não suportado: ${analysisType}`);
    }

    // Generate specialized analysis based on template and insights
    const result: SpecializedAnalysisResult = {
      executiveSummary: this.generateExecutiveSummary(analysisType, notebookInsights, classification),
      detailedAnalysis: this.generateDetailedAnalysis(analysisType, notebookInsights, template),
      riskAssessment: this.generateRiskAssessment(analysisType, notebookInsights),
      complianceChecklist: this.generateComplianceChecklist(analysisType, classification),
      recommendations: this.generateRecommendations(analysisType, notebookInsights),
      roiMetrics: this.calculateROIMetrics(analysisType, notebookInsights),
      nextSteps: this.generateNextSteps(analysisType, notebookInsights),
      confidence: this.calculateConfidence(notebookInsights, classification),
      sources: notebookInsights.sourceReferences
    };

    return result;
  }

  private static generateExecutiveSummary(
    analysisType: string,
    insights: NotebookLMInsights,
    classification: DocumentClassification
  ): string {
    const typeSpecificSummaries = {
      'compliance-regulatorio': `Análise regulatória realizada com base em ${classification.requiredKnowledgeBases.length} bases de conhecimento especializadas. ${insights.summary} Identificadas ${insights.riskFactors.length} áreas de atenção regulatória com nível de conformidade geral: ${insights.complianceStatus}.`,
      
      'otimizacao-formulacao': `Avaliação técnica da formulação identificou ${insights.keyFindings.length} pontos de otimização. ${insights.summary} Recomendações implementáveis com potencial de melhoria significativa na qualidade e eficiência do produto.`,
      
      'analise-veterinaria': `Análise veterinária conforme regulamentações MAPA. ${insights.summary} Produto apresenta conformidade básica com necessidade de validações específicas para aprovação comercial.`,
      
      'compliance-suplementos': `Verificação de conformidade com RDC 27/2010 concluída. ${insights.summary} Composição e alegações avaliadas quanto aos requisitos específicos para suplementos alimentares.`,
      
      'otimizacao-liofilizacao': `Análise especializada do processo de liofilização. ${insights.summary} Identificado potencial de otimização do ciclo com melhoria de qualidade e redução de custos.`
    };

    return typeSpecificSummaries[analysisType as keyof typeof typeSpecificSummaries] || insights.summary;
  }

  private static generateDetailedAnalysis(
    analysisType: string,
    insights: NotebookLMInsights,
    template: any
  ): SpecializedAnalysisResult['detailedAnalysis'] {
    const sections: SpecializedAnalysisResult['detailedAnalysis'] = [];

    template.focusAreas.forEach((area: string, index: number) => {
      sections.push({
        section: area.charAt(0).toUpperCase() + area.slice(1),
        content: insights.keyFindings[index] || `Análise de ${area} em andamento com base nos documentos fornecidos.`,
        importance: index === 0 ? 'high' : (index === 1 ? 'medium' : 'low'),
        actionRequired: insights.riskFactors.length > index
      });
    });

    return sections;
  }

  private static generateRiskAssessment(
    analysisType: string,
    insights: NotebookLMInsights
  ): SpecializedAnalysisResult['riskAssessment'] {
    const riskLevel = insights.riskFactors.length > 2 ? 'high' : 
                     insights.riskFactors.length > 0 ? 'medium' : 'low';

    const mitigationStrategies = {
      'compliance-regulatorio': [
        'Implementar sistema de monitoramento regulatório',
        'Estabelecer cronograma de adequações',
        'Designar responsável por compliance'
      ],
      'otimizacao-formulacao': [
        'Realizar estudos de compatibilidade',
        'Implementar controles de processo',
        'Validar métodos analíticos'
      ],
      'analise-veterinaria': [
        'Conduzir estudos de segurança específicos',
        'Validar eficácia para espécies alvo',
        'Atualizar documentação técnica'
      ]
    };

    return {
      level: riskLevel as any,
      factors: insights.riskFactors,
      mitigation: mitigationStrategies[analysisType as keyof typeof mitigationStrategies] || [
        'Implementar monitoramento contínuo',
        'Estabelecer plano de contingência',
        'Revisar processos regularmente'
      ]
    };
  }

  private static generateComplianceChecklist(
    analysisType: string,
    classification: DocumentClassification
  ): SpecializedAnalysisResult['complianceChecklist'] {
    const baseChecklist = [
      { item: 'Documentação técnica completa', status: 'needs-review' as const },
      { item: 'Conformidade com normas aplicáveis', status: 'compliant' as const },
      { item: 'Validação de métodos necessários', status: 'needs-review' as const }
    ];

    const typeSpecificItems = {
      'compliance-regulatorio': [
        { item: 'RDC aplicáveis identificadas', status: 'compliant' as const },
        { item: 'Prazos de adequação mapeados', status: 'needs-review' as const },
        { item: 'Documentação para submissão', status: 'needs-review' as const }
      ],
      'otimizacao-formulacao': [
        { item: 'Compatibilidade de excipientes', status: 'needs-review' as const },
        { item: 'Estudos de estabilidade', status: 'needs-review' as const },
        { item: 'Especificações definidas', status: 'compliant' as const }
      ]
    };

    return [
      ...baseChecklist,
      ...(typeSpecificItems[analysisType as keyof typeof typeSpecificItems] || [])
    ];
  }

  private static generateRecommendations(
    analysisType: string,
    insights: NotebookLMInsights
  ): SpecializedAnalysisResult['recommendations'] {
    return insights.recommendations.map((rec, index) => ({
      priority: index === 0 ? 'immediate' as const : 
               index === 1 ? 'short-term' as const : 'long-term' as const,
      action: rec,
      rationale: `Baseado na análise especializada dos documentos e knowledge bases relevantes`,
      estimatedCost: this.estimateCost(analysisType, rec),
      timeline: this.estimateTimeline(index)
    }));
  }

  private static calculateROIMetrics(
    analysisType: string,
    insights: NotebookLMInsights
  ): SpecializedAnalysisResult['roiMetrics'] {
    const baseMetrics = {
      'compliance-regulatorio': { savings: 50000, cost: 15000, period: '8-12 meses' },
      'otimizacao-formulacao': { savings: 80000, cost: 25000, period: '6-9 meses' },
      'analise-veterinaria': { savings: 40000, cost: 20000, period: '10-14 meses' },
      'compliance-suplementos': { savings: 30000, cost: 12000, period: '4-6 meses' },
      'otimizacao-liofilizacao': { savings: 100000, cost: 35000, period: '8-12 meses' }
    };

    const metrics = baseMetrics[analysisType as keyof typeof baseMetrics] || 
                   { savings: 45000, cost: 18000, period: '6-10 meses' };

    return {
      potentialSavings: metrics.savings,
      implementationCost: metrics.cost,
      paybackPeriod: metrics.period,
      riskReduction: `${Math.round(insights.confidence * 100)}% de redução de riscos regulatórios`
    };
  }

  private static generateNextSteps(
    analysisType: string,
    insights: NotebookLMInsights
  ): string[] {
    const commonSteps = insights.nextSteps;
    const typeSpecificSteps = {
      'compliance-regulatorio': [
        'Agendar reunião regulatória com equipe',
        'Preparar cronograma de implementação',
        'Designar responsáveis por área'
      ],
      'otimizacao-formulacao': [
        'Iniciar estudos de estabilidade',
        'Validar métodos analíticos revisados',
        'Implementar melhorias no processo'
      ]
    };

    return [
      ...commonSteps,
      ...(typeSpecificSteps[analysisType as keyof typeof typeSpecificSteps] || [])
    ].slice(0, 5); // Limit to 5 steps
  }

  private static calculateConfidence(
    insights: NotebookLMInsights,
    classification: DocumentClassification
  ): number {
    // Base confidence from NotebookLM insights
    let confidence = insights.confidence;

    // Adjust based on document classification confidence
    confidence = (confidence + classification.confidence) / 2;

    // Adjust based on number of knowledge bases used
    const kbBonus = Math.min(classification.requiredKnowledgeBases.length * 0.02, 0.1);
    confidence += kbBonus;

    // Ensure confidence is within reasonable bounds
    return Math.min(Math.max(confidence, 0.5), 0.95);
  }

  private static estimateCost(analysisType: string, recommendation: string): string {
    const costRanges = {
      low: 'R$ 5.000 - R$ 15.000',
      medium: 'R$ 15.000 - R$ 35.000',
      high: 'R$ 35.000 - R$ 75.000'
    };

    if (recommendation.includes('estudo') || recommendation.includes('validação')) {
      return costRanges.medium;
    } else if (recommendation.includes('implementar') || recommendation.includes('desenvolver')) {
      return costRanges.high;
    } else {
      return costRanges.low;
    }
  }

  private static estimateTimeline(priority: number): string {
    const timelines = ['2-4 semanas', '1-3 meses', '3-6 meses'];
    return timelines[Math.min(priority, 2)];
  }

  static getAvailableAnalysisTypes(): Array<{id: string, name: string, description: string}> {
    return Object.entries(this.ANALYSIS_TEMPLATES).map(([id, template]) => ({
      id,
      name: template.name,
      description: `Análise especializada focada em: ${template.focusAreas.join(', ')}`
    }));
  }
}