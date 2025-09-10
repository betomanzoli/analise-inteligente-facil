export const VIABILITY_WEIGHTS = {
  product: 0.20,
  cost: 0.25,
  time: 0.20,
  regulatory: 0.15,
  competition: 0.10,
  market: 0.10,
} as const;

export const PRODUCT_TYPE_OPTIONS = [
  { value: 'medicamento-inovador', label: 'Medicamento Inovador', score: 95 },
  { value: 'medicamento-similar', label: 'Medicamento Similar', score: 75 },
  { value: 'medicamento-generico', label: 'Medicamento Genérico', score: 60 },
  { value: 'dispositivo-medico', label: 'Dispositivo Médico', score: 80 },
  { value: 'suplemento', label: 'Suplemento Alimentar', score: 40 },
  { value: 'cosmetico', label: 'Cosmético', score: 50 },
] as const;

export const DEVELOPMENT_COST_RANGES = [
  { value: 'ate-100k', label: 'Até R$ 100k', score: 90 },
  { value: '100k-500k', label: 'R$ 100k - R$ 500k', score: 75 },
  { value: '500k-2m', label: 'R$ 500k - R$ 2M', score: 60 },
  { value: '2m-10m', label: 'R$ 2M - R$ 10M', score: 40 },
  { value: 'acima-10m', label: 'Acima de R$ 10M', score: 20 },
] as const;

export const TIME_TO_MARKET_OPTIONS = [
  { value: 'ate-6m', label: 'Até 6 meses', score: 95 },
  { value: '6m-1a', label: '6 meses - 1 ano', score: 85 },
  { value: '1a-2a', label: '1 - 2 anos', score: 70 },
  { value: '2a-5a', label: '2 - 5 anos', score: 50 },
  { value: 'acima-5a', label: 'Acima de 5 anos', score: 25 },
] as const;

export const REGULATORY_COMPLEXITY_LEVELS = [
  { value: 'baixa', label: 'Baixa - Notificação simples', score: 90 },
  { value: 'media', label: 'Média - Registro padrão', score: 70 },
  { value: 'alta', label: 'Alta - Estudos clínicos necessários', score: 40 },
  { value: 'muito-alta', label: 'Muito Alta - Aprovação FDA/EMA', score: 20 },
] as const;

export const COMPETITION_LEVELS = [
  { value: 'baixa', label: 'Baixa - Mercado pouco explorado', score: 85 },
  { value: 'media', label: 'Média - Alguns concorrentes', score: 65 },
  { value: 'alta', label: 'Alta - Mercado saturado', score: 35 },
  { value: 'muito-alta', label: 'Muito Alta - Dominado por grandes players', score: 15 },
] as const;

export const MARKET_SIZE_OPTIONS = [
  { value: 'nicho', label: 'Nicho - < R$ 10M', score: 30 },
  { value: 'pequeno', label: 'Pequeno - R$ 10M - R$ 100M', score: 50 },
  { value: 'medio', label: 'Médio - R$ 100M - R$ 1B', score: 75 },
  { value: 'grande', label: 'Grande - > R$ 1B', score: 95 },
] as const;

export const VIABILITY_LEVELS = [
  { min: 0, max: 30, level: 'Baixa', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: '❌' },
  { min: 31, max: 60, level: 'Média', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠️' },
  { min: 61, max: 80, level: 'Alta', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '✅' },
  { min: 81, max: 100, level: 'Muito Alta', color: 'text-green-600', bgColor: 'bg-green-100', icon: '🚀' },
] as const;

export const FORM_LABELS = {
  productType: 'Tipo de Produto',
  developmentCost: 'Custo Estimado de Desenvolvimento',
  timeToMarket: 'Tempo até o Mercado',
  regulatoryComplexity: 'Complexidade Regulatória',
  competitionLevel: 'Nível de Competição',
  marketSize: 'Tamanho do Mercado',
} as const;

export const TOOLTIPS = {
  productType: 'Selecione o tipo de produto que melhor descreve seu projeto',
  developmentCost: 'Estimativa total dos custos de desenvolvimento até o lançamento',
  timeToMarket: 'Tempo estimado desde o início do desenvolvimento até a comercialização',
  regulatoryComplexity: 'Nível de complexidade dos requisitos regulatórios aplicáveis',
  competitionLevel: 'Intensidade da competição no mercado-alvo',
  marketSize: 'Tamanho estimado do mercado em que o produto será lançado',
} as const;