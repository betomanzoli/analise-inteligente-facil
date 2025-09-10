export const PRODUCT_TYPES = {
  pharmaceutical_innovator: 'Fármaco Inovador',
  pharmaceutical_generic: 'Genérico/Similar', 
  medical_device_class_I_II: 'Dispositivo Médico Classe I/II',
  medical_device_class_III: 'Dispositivo Médico Classe III',
  biological: 'Biológico/Biossimilar',
  cosmetic: 'Cosmecêutico'
} as const;

export const DEVELOPMENT_PHASES = {
  research: 'Pesquisa/Conceito',
  development: 'Desenvolvimento Pré-clínico', 
  clinical: 'Fases Clínicas/Validação',
  registration: 'Registro e Lançamento'
} as const;

export const COMPLEXITY_LEVELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
} as const;

export const TEAM_SIZES = {
  small: 'Pequena (até 5 pessoas)',
  medium: 'Média (6 a 15 pessoas)', 
  large: 'Grande (mais de 15 pessoas)'
} as const;

// Base costs in thousands of R$ per month
export const BASE_COSTS = {
  pharmaceutical_innovator: { base: 200, regulatory: 80, quality: 60 },
  pharmaceutical_generic: { base: 120, regulatory: 40, quality: 30 },
  medical_device_class_I_II: { base: 80, regulatory: 20, quality: 25 },
  medical_device_class_III: { base: 150, regulatory: 50, quality: 40 },
  biological: { base: 250, regulatory: 100, quality: 70 },
  cosmetic: { base: 60, regulatory: 15, quality: 20 }
} as const;

// Multipliers for different factors
export const MULTIPLIERS = {
  phase: {
    research: 0.7,
    development: 1.0,
    clinical: 1.8,
    registration: 1.2
  },
  complexity: {
    low: 0.8,
    medium: 1.0,
    high: 1.4
  },
  teamSize: {
    small: 0.7,
    medium: 1.0,
    large: 1.5
  }
} as const;

export const RECOMMENDATIONS = {
  highCost: "Projetos com custos elevados requerem planejamento de contingência de 15-20% para gerenciar riscos de estouro de orçamento.",
  highComplexity: "Alta complexidade técnica aumenta significativamente os riscos. Considere consultoria especializada para otimização.",
  longDuration: "Projetos longos têm maior exposição a mudanças regulatórias. Monitore atualizações das agências regularmente.",
  largeTeam: "Equipes grandes requerem gestão de projeto robusta. Considere metodologias ágeis para otimização de recursos.",
  clinical: "Fase clínica representa o maior custo. Planejamento detalhado de estudos pode otimizar significativamente o orçamento."
} as const;