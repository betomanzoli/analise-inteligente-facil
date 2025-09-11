export interface DocumentClassification {
  type: 'regulatory' | 'formulation' | 'veterinary' | 'supplements' | 'lyophilization' | 'technical' | 'unknown';
  confidence: number;
  subtype?: string;
  requiredKnowledgeBases: string[];
  recommendedAnalysis: string[];
  detectedElements: {
    hasRegulations: boolean;
    hasFormulations: boolean;
    hasAnimalContent: boolean;
    hasSupplementData: boolean;
    hasLyophilizationContent: boolean;
    hasTechnicalSpecs: boolean;
  };
}

export class DocumentClassifier {
  private static readonly CLASSIFICATION_PATTERNS = {
    regulatory: {
      keywords: ['anvisa', 'fda', 'rdc', 'cfr', 'ich', 'regulamentação', 'compliance', 'registro', 'licença'],
      phrases: ['boas práticas', 'good manufacturing practices', 'validação analítica', 'regulatory compliance'],
      confidence: 0.9
    },
    formulation: {
      keywords: ['formulação', 'excipiente', 'ativo', 'solubilidade', 'estabilidade', 'dissolução', 'bioequivalência'],
      phrases: ['desenvolvimento farmacêutico', 'otimização de formulação', 'pharmaceutical development'],
      confidence: 0.85
    },
    veterinary: {
      keywords: ['veterinário', 'animal', 'bovino', 'suíno', 'equino', 'canino', 'felino', 'aves'],
      phrases: ['medicamento veterinário', 'uso veterinário', 'animal health'],
      confidence: 0.9
    },
    supplements: {
      keywords: ['suplemento', 'nutracêutico', 'vitamina', 'mineral', 'rdc 27', 'alimento funcional'],
      phrases: ['suplemento alimentar', 'dietary supplement', 'food supplement'],
      confidence: 0.88
    },
    lyophilization: {
      keywords: ['liofilização', 'freeze', 'drying', 'sublimação', 'cristalização', 'ciclo de liofilização'],
      phrases: ['lyophilization cycle', 'freeze drying', 'liofilizado'],
      confidence: 0.92
    }
  };

  static async classifyDocument(file: File): Promise<DocumentClassification> {
    try {
      const text = await this.extractTextFromFile(file);
      const classification = this.analyzeContent(text, file.name);
      
      return {
        ...classification,
        requiredKnowledgeBases: this.selectKnowledgeBases(classification.type),
        recommendedAnalysis: this.getRecommendedAnalysis(classification.type, classification.detectedElements)
      };
    } catch (error) {
      console.error('Document classification failed:', error);
      return this.getDefaultClassification();
    }
  }

  private static async extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      // For PDF files, we'll rely on the backend processing
      return file.name + ' ' + (file.size > 0 ? 'pdf_content' : '');
    } else if (file.type.startsWith('text/')) {
      return await file.text();
    } else {
      // Use filename and metadata for classification
      return file.name;
    }
  }

  private static analyzeContent(text: string, filename: string): Omit<DocumentClassification, 'requiredKnowledgeBases' | 'recommendedAnalysis'> {
    const content = (text + ' ' + filename).toLowerCase();
    let bestMatch: DocumentClassification['type'] = 'unknown';
    let highestScore = 0;
    let detectedElements = {
      hasRegulations: false,
      hasFormulations: false,
      hasAnimalContent: false,
      hasSupplementData: false,
      hasLyophilizationContent: false,
      hasTechnicalSpecs: false
    };

    // Analyze content against each pattern
    for (const [type, pattern] of Object.entries(this.CLASSIFICATION_PATTERNS)) {
      let score = 0;
      
      // Check keywords
      for (const keyword of pattern.keywords) {
        if (content.includes(keyword)) {
          score += 1;
        }
      }
      
      // Check phrases (higher weight)
      for (const phrase of pattern.phrases) {
        if (content.includes(phrase)) {
          score += 2;
        }
      }
      
      // Normalize score
      const normalizedScore = score / (pattern.keywords.length + pattern.phrases.length * 2);
      
      if (normalizedScore > highestScore) {
        highestScore = normalizedScore;
        bestMatch = type as DocumentClassification['type'];
      }

      // Update detected elements
      if (normalizedScore > 0.1) {
        switch (type) {
          case 'regulatory':
            detectedElements.hasRegulations = true;
            break;
          case 'formulation':
            detectedElements.hasFormulations = true;
            break;
          case 'veterinary':
            detectedElements.hasAnimalContent = true;
            break;
          case 'supplements':
            detectedElements.hasSupplementData = true;
            break;
          case 'lyophilization':
            detectedElements.hasLyophilizationContent = true;
            break;
        }
      }
    }

    // Technical specs detection
    if (content.includes('especificação') || content.includes('specification') || content.includes('método analítico')) {
      detectedElements.hasTechnicalSpecs = true;
    }

    return {
      type: bestMatch,
      confidence: Math.min(highestScore * 0.9, 0.95), // Cap confidence at 95%
      subtype: this.getSubtype(bestMatch, content),
      detectedElements
    };
  }

  private static getSubtype(type: DocumentClassification['type'], content: string): string | undefined {
    switch (type) {
      case 'regulatory':
        if (content.includes('anvisa')) return 'ANVISA';
        if (content.includes('fda')) return 'FDA';
        if (content.includes('ich')) return 'ICH';
        return 'General';
      case 'formulation':
        if (content.includes('sólido')) return 'Solid Dosage';
        if (content.includes('líquido')) return 'Liquid';
        if (content.includes('injetável')) return 'Injectable';
        return 'General';
      case 'veterinary':
        if (content.includes('bovino')) return 'Bovine';
        if (content.includes('canino')) return 'Canine';
        if (content.includes('equino')) return 'Equine';
        return 'General';
      default:
        return undefined;
    }
  }

  private static selectKnowledgeBases(type: DocumentClassification['type']): string[] {
    const knowledgeBases: Record<string, string[]> = {
      regulatory: ['regulatory_pharma', 'ich_guidelines', 'anvisa_regulations'],
      formulation: ['formulation_guidelines', 'excipients_database', 'stability_protocols'],
      veterinary: ['veterinary_rules', 'animal_health_regulations', 'veterinary_pharmacology'],
      supplements: ['supplements_regulations', 'rdc27_guidelines', 'nutraceuticals_standards'],
      lyophilization: ['lyophilization_knowledge', 'freeze_drying_protocols', 'formulation_guidelines'],
      technical: ['analytical_methods', 'quality_standards', 'technical_specifications'],
      unknown: ['general_pharma_knowledge']
    };

    return knowledgeBases[type] || knowledgeBases.unknown;
  }

  private static getRecommendedAnalysis(type: DocumentClassification['type'], elements: DocumentClassification['detectedElements']): string[] {
    const recommendations: string[] = [];

    switch (type) {
      case 'regulatory':
        recommendations.push('Análise de Compliance Regulatório');
        if (elements.hasFormulations) recommendations.push('Análise de Formulação');
        break;
      case 'formulation':
        recommendations.push('Otimização de Formulação');
        if (elements.hasRegulations) recommendations.push('Compliance Regulatório');
        if (elements.hasLyophilizationContent) recommendations.push('Otimização de Liofilização');
        break;
      case 'veterinary':
        recommendations.push('Análise Regulatória Veterinária');
        if (elements.hasFormulations) recommendations.push('Desenvolvimento Veterinário');
        break;
      case 'supplements':
        recommendations.push('Compliance para Suplementos');
        recommendations.push('Análise Nutracêutica');
        break;
      case 'lyophilization':
        recommendations.push('Otimização de Liofilização');
        recommendations.push('Desenvolvimento de Ciclo');
        break;
      default:
        recommendations.push('Análise Geral');
    }

    return recommendations;
  }

  private static getDefaultClassification(): DocumentClassification {
    return {
      type: 'unknown',
      confidence: 0.1,
      requiredKnowledgeBases: ['general_pharma_knowledge'],
      recommendedAnalysis: ['Análise Geral'],
      detectedElements: {
        hasRegulations: false,
        hasFormulations: false,
        hasAnimalContent: false,
        hasSupplementData: false,
        hasLyophilizationContent: false,
        hasTechnicalSpecs: false
      }
    };
  }
}