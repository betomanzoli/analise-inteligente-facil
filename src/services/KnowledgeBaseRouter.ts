import { DocumentClassification } from './DocumentClassifier';

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  category: string;
  notebookId?: string; // NotebookLM notebook ID
  documentCount: number;
  lastUpdated: Date;
  isActive: boolean;
  tags: string[];
}

export interface ProjectKnowledgeBundle {
  clientDocuments: File[];
  selectedKnowledgeBases: KnowledgeBase[];
  crossReferences: string[];
  totalDocuments: number;
  estimatedProcessingTime: number;
}

export class KnowledgeBaseRouter {
  private static readonly MASTER_KNOWLEDGE_BASES: KnowledgeBase[] = [
    {
      id: 'regulatory_pharma',
      name: 'Legislação Farmacêutica Brasil',
      description: 'Regulamentações ANVISA, RDCs, Instruções Normativas',
      category: 'regulatory',
      documentCount: 150,
      lastUpdated: new Date('2024-01-15'),
      isActive: true,
      tags: ['anvisa', 'rdc', 'brasil', 'compliance']
    },
    {
      id: 'fda_regulations',
      name: 'FDA Regulations & Guidelines',
      description: 'CFR, FDA Guidelines, Orange Book',
      category: 'regulatory',
      documentCount: 120,
      lastUpdated: new Date('2024-01-10'),
      isActive: true,
      tags: ['fda', 'cfr', 'usa', 'compliance']
    },
    {
      id: 'ich_guidelines',
      name: 'ICH Guidelines Completo',
      description: 'Todos os guidelines ICH Q, E, S, M',
      category: 'regulatory',
      documentCount: 85,
      lastUpdated: new Date('2024-01-12'),
      isActive: true,
      tags: ['ich', 'international', 'quality', 'safety']
    },
    {
      id: 'supplements_rdc27',
      name: 'Suplementos - RDC 27/2010',
      description: 'Legislação específica para suplementos alimentares',
      category: 'supplements',
      documentCount: 45,
      lastUpdated: new Date('2024-01-08'),
      isActive: true,
      tags: ['suplementos', 'rdc27', 'alimentos', 'anvisa']
    },
    {
      id: 'veterinary_regulations',
      name: 'Regulamentações Veterinárias',
      description: 'MAPA, medicamentos veterinários, saúde animal',
      category: 'veterinary',
      documentCount: 75,
      lastUpdated: new Date('2024-01-05'),
      isActive: true,
      tags: ['veterinario', 'mapa', 'animal', 'medicamentos']
    },
    {
      id: 'lyophilization_expertise',
      name: 'Liofilização - Knowledge Base',
      description: 'Ciclos, formulação, otimização, troubleshooting',
      category: 'formulation',
      documentCount: 95,
      lastUpdated: new Date('2024-01-18'),
      isActive: true,
      tags: ['liofilizacao', 'freeze-drying', 'formulation', 'optimization']
    },
    {
      id: 'formulation_guidelines',
      name: 'Desenvolvimento de Formulação',
      description: 'Boas práticas, estabilidade, compatibilidade',
      category: 'formulation',
      documentCount: 110,
      lastUpdated: new Date('2024-01-14'),
      isActive: true,
      tags: ['formulacao', 'desenvolvimento', 'estabilidade', 'excipientes']
    },
    {
      id: 'analytical_methods',
      name: 'Métodos Analíticos Farmacêuticos',
      description: 'Validação, HPLC, cromatografia, espectroscopia',
      category: 'analytical',
      documentCount: 80,
      lastUpdated: new Date('2024-01-11'),
      isActive: true,
      tags: ['analitico', 'hplc', 'validacao', 'metodos']
    }
  ];

  static selectOptimalKnowledgeBases(
    classification: DocumentClassification,
    analysisType?: string
  ): ProjectKnowledgeBundle {
    const selectedBases: KnowledgeBase[] = [];
    const crossReferences: string[] = [];

    // Core knowledge bases based on document classification
    const primaryBases = this.selectPrimaryBases(classification);
    selectedBases.push(...primaryBases);

    // Add complementary bases based on detected elements
    const complementaryBases = this.selectComplementaryBases(classification.detectedElements);
    selectedBases.push(...complementaryBases);

    // Add analysis-specific bases
    if (analysisType) {
      const analysisBases = this.selectAnalysisSpecificBases(analysisType);
      selectedBases.push(...analysisBases);
    }

    // Remove duplicates and ensure active bases only
    const uniqueBases = this.deduplicateAndFilter(selectedBases);

    // Generate cross-references
    const crossRefs = this.generateCrossReferences(uniqueBases, classification.type);

    return {
      clientDocuments: [], // Will be populated later
      selectedKnowledgeBases: uniqueBases,
      crossReferences: crossRefs,
      totalDocuments: uniqueBases.reduce((sum, base) => sum + base.documentCount, 0),
      estimatedProcessingTime: this.calculateProcessingTime(uniqueBases.length)
    };
  }

  private static selectPrimaryBases(classification: DocumentClassification): KnowledgeBase[] {
    const bases: KnowledgeBase[] = [];

    switch (classification.type) {
      case 'regulatory':
        bases.push(
          this.getKnowledgeBase('regulatory_pharma'),
          this.getKnowledgeBase('ich_guidelines')
        );
        if (classification.subtype === 'FDA') {
          bases.push(this.getKnowledgeBase('fda_regulations'));
        }
        break;

      case 'formulation':
        bases.push(
          this.getKnowledgeBase('formulation_guidelines'),
          this.getKnowledgeBase('analytical_methods')
        );
        break;

      case 'veterinary':
        bases.push(
          this.getKnowledgeBase('veterinary_regulations'),
          this.getKnowledgeBase('regulatory_pharma') // Also need general pharma regs
        );
        break;

      case 'supplements':
        bases.push(
          this.getKnowledgeBase('supplements_rdc27'),
          this.getKnowledgeBase('regulatory_pharma')
        );
        break;

      case 'lyophilization':
        bases.push(
          this.getKnowledgeBase('lyophilization_expertise'),
          this.getKnowledgeBase('formulation_guidelines')
        );
        break;

      default:
        bases.push(this.getKnowledgeBase('regulatory_pharma'));
    }

    return bases.filter(Boolean);
  }

  private static selectComplementaryBases(elements: DocumentClassification['detectedElements']): KnowledgeBase[] {
    const bases: KnowledgeBase[] = [];

    if (elements.hasRegulations) {
      bases.push(this.getKnowledgeBase('regulatory_pharma'));
    }

    if (elements.hasFormulations) {
      bases.push(this.getKnowledgeBase('formulation_guidelines'));
    }

    if (elements.hasAnimalContent) {
      bases.push(this.getKnowledgeBase('veterinary_regulations'));
    }

    if (elements.hasSupplementData) {
      bases.push(this.getKnowledgeBase('supplements_rdc27'));
    }

    if (elements.hasLyophilizationContent) {
      bases.push(this.getKnowledgeBase('lyophilization_expertise'));
    }

    if (elements.hasTechnicalSpecs) {
      bases.push(this.getKnowledgeBase('analytical_methods'));
    }

    return bases.filter(Boolean);
  }

  private static selectAnalysisSpecificBases(analysisType: string): KnowledgeBase[] {
    const analysisMapping: Record<string, string[]> = {
      'compliance-regulatorio': ['regulatory_pharma', 'ich_guidelines'],
      'otimizacao-formulacao': ['formulation_guidelines', 'lyophilization_expertise'],
      'analise-veterinaria': ['veterinary_regulations', 'regulatory_pharma'],
      'compliance-suplementos': ['supplements_rdc27', 'regulatory_pharma'],
      'otimizacao-liofilizacao': ['lyophilization_expertise', 'formulation_guidelines'],
      'metodos-analiticos': ['analytical_methods', 'regulatory_pharma']
    };

    const baseIds = analysisMapping[analysisType] || [];
    return baseIds.map(id => this.getKnowledgeBase(id)).filter(Boolean);
  }

  private static getKnowledgeBase(id: string): KnowledgeBase | null {
    return this.MASTER_KNOWLEDGE_BASES.find(base => base.id === id) || null;
  }

  private static deduplicateAndFilter(bases: KnowledgeBase[]): KnowledgeBase[] {
    const seen = new Set<string>();
    return bases.filter(base => {
      if (!base || !base.isActive || seen.has(base.id)) {
        return false;
      }
      seen.add(base.id);
      return true;
    });
  }

  private static generateCrossReferences(bases: KnowledgeBase[], documentType: string): string[] {
    const references: string[] = [];

    // Add type-specific cross-references
    if (documentType === 'regulatory') {
      references.push(
        'Verificar compliance com RDC atual',
        'Consultar guidelines ICH relacionados',
        'Validar contra normas internacionais'
      );
    } else if (documentType === 'formulation') {
      references.push(
        'Verificar compatibilidade de excipientes',
        'Consultar dados de estabilidade',
        'Validar métodos analíticos'
      );
    }

    // Add base-specific references
    bases.forEach(base => {
      if (base.category === 'regulatory') {
        references.push(`Consultar atualizações em ${base.name}`);
      }
    });

    return [...new Set(references)]; // Remove duplicates
  }

  private static calculateProcessingTime(baseCount: number): number {
    // Base time: 2 minutes per knowledge base + client documents processing
    const baseTime = baseCount * 120; // 2 minutes per base in seconds
    const clientDocTime = 180; // 3 minutes for client document processing
    const analysisTime = 240; // 4 minutes for specialized analysis
    
    return baseTime + clientDocTime + analysisTime;
  }

  static getAvailableKnowledgeBases(): KnowledgeBase[] {
    return this.MASTER_KNOWLEDGE_BASES.filter(base => base.isActive);
  }

  static getKnowledgeBaseById(id: string): KnowledgeBase | null {
    return this.getKnowledgeBase(id);
  }

  static updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): boolean {
    const index = this.MASTER_KNOWLEDGE_BASES.findIndex(base => base.id === id);
    if (index === -1) return false;

    this.MASTER_KNOWLEDGE_BASES[index] = {
      ...this.MASTER_KNOWLEDGE_BASES[index],
      ...updates,
      lastUpdated: new Date()
    };
    return true;
  }
}