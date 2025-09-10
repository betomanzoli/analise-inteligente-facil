import { ViabilityFormData, ViabilityResult, ViabilityScores } from './types';
import {
  VIABILITY_WEIGHTS,
  PRODUCT_TYPE_OPTIONS,
  DEVELOPMENT_COST_RANGES,
  TIME_TO_MARKET_OPTIONS,
  REGULATORY_COMPLEXITY_LEVELS,
  COMPETITION_LEVELS,
  MARKET_SIZE_OPTIONS,
  VIABILITY_LEVELS,
} from './constants';

/**
 * Calcula o score para cada categoria com base nos valores selecionados
 */
function calculateScores(formData: ViabilityFormData): ViabilityScores {
  const getScore = (value: string, options: readonly { value: string; score: number }[]) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.score : 0;
  };

  return {
    product: getScore(formData.productType, PRODUCT_TYPE_OPTIONS),
    cost: getScore(formData.developmentCost, DEVELOPMENT_COST_RANGES),
    time: getScore(formData.timeToMarket, TIME_TO_MARKET_OPTIONS),
    regulatory: getScore(formData.regulatoryComplexity, REGULATORY_COMPLEXITY_LEVELS),
    competition: getScore(formData.competitionLevel, COMPETITION_LEVELS),
    market: getScore(formData.marketSize, MARKET_SIZE_OPTIONS),
  };
}

/**
 * Calcula a pontuação final ponderada
 */
function calculateWeightedScore(scores: ViabilityScores): number {
  return Math.round(
    scores.product * VIABILITY_WEIGHTS.product +
    scores.cost * VIABILITY_WEIGHTS.cost +
    scores.time * VIABILITY_WEIGHTS.time +
    scores.regulatory * VIABILITY_WEIGHTS.regulatory +
    scores.competition * VIABILITY_WEIGHTS.competition +
    scores.market * VIABILITY_WEIGHTS.market
  );
}

/**
 * Determina o nível de viabilidade com base na pontuação
 */
function getViabilityLevel(percentage: number) {
  const level = VIABILITY_LEVELS.find(l => percentage >= l.min && percentage <= l.max);
  return level || VIABILITY_LEVELS[0];
}

/**
 * Gera recomendações baseadas nos scores individuais
 */
function generateRecommendations(scores: ViabilityScores, formData: ViabilityFormData): string[] {
  const recommendations: string[] = [];

  // Recomendações baseadas em scores baixos (< 50)
  if (scores.cost < 50) {
    recommendations.push(
      'Custos elevados identificados. Considere parcerias estratégicas ou financiamento especializado para viabilizar o projeto.'
    );
  }

  if (scores.regulatory < 50) {
    recommendations.push(
      'Alta complexidade regulatória. Recomendamos consultoria especializada em assuntos regulatórios desde o início do projeto.'
    );
  }

  if (scores.time < 50) {
    recommendations.push(
      'Cronograma extenso detectado. Avalie marcos intermediários e possibilidades de acelerar o desenvolvimento.'
    );
  }

  if (scores.competition < 50) {
    recommendations.push(
      'Mercado altamente competitivo. Desenvolva propostas de valor únicos e estratégias de diferenciação robustas.'
    );
  }

  if (scores.market < 50) {
    recommendations.push(
      'Mercado de nicho identificado. Valide profundamente a demanda e considere estratégias de expansão gradual.'
    );
  }

  // Recomendações baseadas em combinações específicas
  if (scores.cost <= 50 && scores.regulatory <= 50) {
    recommendations.push(
      'Combinação de custos altos e complexidade regulatória. Priorize uma análise de viabilidade econômica detalhada antes de prosseguir.'
    );
  }

  if (scores.product >= 80 && scores.market >= 70) {
    recommendations.push(
      'Produto inovador em mercado promissor. Explore oportunidades de proteção intelectual e parcerias comerciais estratégicas.'
    );
  }

  if (scores.time >= 70 && scores.regulatory >= 70) {
    recommendations.push(
      'Cronograma favorável com baixa complexidade regulatória. Considere acelerar o desenvolvimento para capturar vantagem competitiva.'
    );
  }

  // Recomendação padrão se nenhuma específica se aplicar
  if (recommendations.length === 0) {
    recommendations.push(
      'Projeto apresenta características equilibradas. Mantenha foco na execução e monitoramento contínuo dos riscos identificados.'
    );
  }

  // Sempre adicionar recomendação para consultoria especializada
  recommendations.push(
    'Para uma análise mais detalhada e personalizada, recomendamos uma consultoria especializada em Life Sciences.'
  );

  return recommendations;
}

/**
 * Gera um resumo executivo do resultado
 */
function generateSummary(percentage: number, level: string, formData: ViabilityFormData): string {
  const productTypeLabel = PRODUCT_TYPE_OPTIONS.find(opt => opt.value === formData.productType)?.label || 'Produto';
  
  return `Seu projeto de ${productTypeLabel} apresenta viabilidade ${level.toLowerCase()} (${percentage}%). ` +
    `Esta análise considera fatores como custos, cronograma, complexidade regulatória e dinâmica de mercado. ` +
    `Use este resultado como ponto de partida para discussões mais aprofundadas com especialistas.`;
}

/**
 * Função principal de cálculo de viabilidade
 */
export function calculateViability(formData: ViabilityFormData): ViabilityResult {
  // Calcular scores individuais
  const scores = calculateScores(formData);
  
  // Calcular pontuação final ponderada
  const percentage = calculateWeightedScore(scores);
  
  // Determinar nível de viabilidade
  const viabilityLevel = getViabilityLevel(percentage);
  
  // Gerar recomendações
  const recommendations = generateRecommendations(scores, formData);
  
  // Gerar resumo
  const summary = generateSummary(percentage, viabilityLevel.level, formData);

  return {
    percentage,
    level: viabilityLevel.level as 'Baixa' | 'Média' | 'Alta' | 'Muito Alta',
    color: viabilityLevel.color,
    icon: viabilityLevel.icon,
    scores,
    recommendations,
    summary,
  };
}