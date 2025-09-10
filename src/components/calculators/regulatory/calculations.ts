import { RegulatoryFormData, RegulatoryResult } from './types';
import { RISK_SCORES, RECOMMENDATIONS, PRODUCT_CATEGORIES, CLINICAL_EVIDENCE } from './constants';

export function calculateRegulatoryRisk(formData: RegulatoryFormData): RegulatoryResult {
  // Calculate individual score components
  const baseScore = RISK_SCORES.base[formData.productCategory];
  const noveltyScore = RISK_SCORES.novelty[formData.noveltyDegree];
  const marketsScore = formData.targetMarkets.reduce((sum, market) => sum + RISK_SCORES.markets[market], 0);
  const evidenceScore = RISK_SCORES.evidence[formData.clinicalEvidence];
  const mitigationScore = formData.mitigationFactors.reduce((sum, factor) => sum + RISK_SCORES.mitigation[factor], 0);
  
  // Calculate final risk score (0-100, clamped)
  const rawScore = baseScore + noveltyScore + marketsScore + evidenceScore + mitigationScore;
  const riskScore = Math.max(0, Math.min(100, rawScore));
  
  // Determine risk level and color
  const { riskLevel, riskColor } = getRiskLevel(riskScore);
  
  // Identify critical factors
  const criticalFactors = identifyCriticalFactors(formData, { baseScore, noveltyScore, marketsScore, evidenceScore });
  
  // Generate mitigation opportunities
  const mitigationOpportunities = generateMitigationOpportunities(formData, riskScore);
  
  // Estimate timeline
  const estimatedTimeline = estimateTimeline(formData, riskScore);
  
  // Generate recommendations
  const recommendations = generateRecommendations(formData, riskScore);
  
  // Generate summary
  const summary = generateSummary(formData, riskScore, riskLevel);
  
  return {
    riskScore,
    riskLevel,
    riskColor,
    criticalFactors,
    mitigationOpportunities,
    estimatedTimeline,
    recommendations,
    summary,
    scoreBreakdown: {
      base: baseScore,
      novelty: noveltyScore,
      markets: marketsScore,
      evidence: evidenceScore,
      mitigation: mitigationScore
    }
  };
}

function getRiskLevel(score: number): { riskLevel: RegulatoryResult['riskLevel']; riskColor: string } {
  if (score <= 20) return { riskLevel: 'Muito Baixo', riskColor: 'text-green-600' };
  if (score <= 35) return { riskLevel: 'Baixo', riskColor: 'text-green-500' };
  if (score <= 55) return { riskLevel: 'Moderado', riskColor: 'text-yellow-500' };
  if (score <= 75) return { riskLevel: 'Alto', riskColor: 'text-orange-500' };
  return { riskLevel: 'Muito Alto', riskColor: 'text-red-500' };
}

function identifyCriticalFactors(formData: RegulatoryFormData, scores: any): string[] {
  const factors: string[] = [];
  
  if (scores.baseScore >= 35) {
    factors.push(`Categoria de produto (${PRODUCT_CATEGORIES[formData.productCategory]}) - alta complexidade regulatória`);
  }
  
  if (scores.noveltyScore >= 25) {
    factors.push('Tecnologia pioneira - exigirá comunicação extensiva com agências');
  }
  
  if (formData.targetMarkets.length > 2) {
    factors.push('Múltiplas jurisdições - complexidade de harmonização regulatória');
  }
  
  if (scores.evidenceScore >= 20) {
    factors.push(`${CLINICAL_EVIDENCE[formData.clinicalEvidence]} - requisitos extensivos de evidência clínica`);
  }
  
  if (formData.mitigationFactors.length === 0) {
    factors.push('Ausência de fatores de mitigação - risco não gerenciado');
  }
  
  return factors;
}

function generateMitigationOpportunities(formData: RegulatoryFormData, riskScore: number): string[] {
  const opportunities: string[] = [];
  
  if (!formData.mitigationFactors.includes('pre_submission_meeting')) {
    opportunities.push('Agendar reuniões de pré-submissão com as agências reguladoras');
  }
  
  if (!formData.mitigationFactors.includes('expert_consulting')) {
    opportunities.push('Contratar consultoria regulatória especializada');
  }
  
  if (formData.productCategory === 'medical_device' && !formData.mitigationFactors.includes('clear_predicate')) {
    opportunities.push('Estabelecer dispositivo predicado bem definido');
  }
  
  if (!formData.mitigationFactors.includes('accelerated_pathway')) {
    opportunities.push('Investigar elegibilidade para vias regulatórias aceleradas');
  }
  
  if (riskScore > 60) {
    opportunities.push('Considerar abordagem faseada de entrada no mercado');
    opportunities.push('Desenvolver plano robusto de gestão de riscos regulatórios');
  }
  
  return opportunities;
}

function estimateTimeline(formData: RegulatoryFormData, riskScore: number): RegulatoryResult['estimatedTimeline'] {
  // Base timeline estimates in months based on product category
  const baseTimelines = {
    pharmaceutical: { opt: 24, real: 36, pess: 48 },
    biological: { opt: 30, real: 42, pess: 60 },
    medical_device: { opt: 12, real: 18, pess: 24 },
    food_supplement: { opt: 6, real: 9, pess: 12 },
    cosmetic: { opt: 3, real: 6, pess: 9 }
  };
  
  const base = baseTimelines[formData.productCategory];
  
  // Apply modifiers based on risk factors
  let modifier = 1.0;
  
  if (formData.noveltyDegree === 'pioneer') modifier += 0.3;
  if (formData.targetMarkets.length > 2) modifier += 0.2;
  if (formData.clinicalEvidence === 'pivotal_studies') modifier += 0.4;
  if (riskScore > 70) modifier += 0.2;
  
  // Apply mitigation factor
  if (formData.mitigationFactors.length > 2) modifier -= 0.15;
  
  return {
    optimistic: `${Math.round(base.opt * modifier)} meses`,
    realistic: `${Math.round(base.real * modifier)} meses`, 
    pessimistic: `${Math.round(base.pess * modifier)} meses`
  };
}

function generateRecommendations(formData: RegulatoryFormData, riskScore: number): string[] {
  const recommendations: string[] = [];
  
  if (riskScore > 70) {
    recommendations.push(RECOMMENDATIONS.high_risk);
  }
  
  if (formData.noveltyDegree === 'pioneer') {
    recommendations.push(RECOMMENDATIONS.pioneer_technology);
  }
  
  if (formData.targetMarkets.length > 2) {
    recommendations.push(RECOMMENDATIONS.multiple_markets);
  }
  
  if (formData.clinicalEvidence === 'pivotal_studies') {
    recommendations.push(RECOMMENDATIONS.complex_evidence);
  }
  
  if (formData.mitigationFactors.length === 0) {
    recommendations.push(RECOMMENDATIONS.no_mitigation);
  }
  
  // Always add consultation recommendation
  recommendations.push(RECOMMENDATIONS.consultation);
  
  return recommendations;
}

function generateSummary(formData: RegulatoryFormData, riskScore: number, riskLevel: string): string {
  const productType = PRODUCT_CATEGORIES[formData.productCategory];
  const marketsText = formData.targetMarkets.length === 1 ? '1 mercado' : `${formData.targetMarkets.length} mercados`;
  
  return `Projeto de ${productType} com submissão planejada para ${marketsText} regulatório(s). Risco regulatório avaliado como ${riskLevel} (${riskScore}%). A estratégia de mitigação deve focar nos fatores críticos identificados para otimizar cronograma e reduzir incertezas regulatórias.`;
}