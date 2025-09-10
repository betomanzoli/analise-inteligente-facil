import { CostFormData, CostResult, CostBreakdown } from './types';
import { BASE_COSTS, MULTIPLIERS, RECOMMENDATIONS } from './constants';

export function calculateCost(formData: CostFormData): CostResult {
  const baseCosts = BASE_COSTS[formData.productType];
  const phaseMultiplier = MULTIPLIERS.phase[formData.developmentPhase];
  const complexityMultiplier = MULTIPLIERS.complexity[formData.complexityLevel];
  const teamMultiplier = MULTIPLIERS.teamSize[formData.teamSize];
  
  // Calculate base monthly costs
  const baseMonthlyCost = baseCosts.base * phaseMultiplier * complexityMultiplier * teamMultiplier;
  const regulatoryMonthlyCost = baseCosts.regulatory * phaseMultiplier * complexityMultiplier;
  const qualityMonthlyCost = baseCosts.quality * phaseMultiplier * complexityMultiplier;
  
  // Apply market multiplier for regulatory costs
  const marketMultiplier = formData.regulatoryMarkets.length > 1 ? 1.3 : 1.0;
  const adjustedRegulatoryMonthlyCost = regulatoryMonthlyCost * marketMultiplier;
  
  // Clinical study adjustment
  const clinicalMultiplier = formData.requiresClinicalStudy ? 1.6 : 1.0;
  const finalBaseMonthlyCost = baseMonthlyCost * clinicalMultiplier;
  
  const monthlyCost = finalBaseMonthlyCost + adjustedRegulatoryMonthlyCost + qualityMonthlyCost;
  const totalCost = monthlyCost * formData.duration;
  
  // Calculate breakdown
  const breakdown: CostBreakdown = {
    development: finalBaseMonthlyCost * formData.duration,
    regulatory: adjustedRegulatoryMonthlyCost * formData.duration,
    quality: qualityMonthlyCost * formData.duration
  };
  
  const breakdownPercentages = {
    development: (breakdown.development / totalCost) * 100,
    regulatory: (breakdown.regulatory / totalCost) * 100,
    quality: (breakdown.quality / totalCost) * 100
  };
  
  // Generate recommendations
  const recommendations = generateRecommendations(formData, totalCost, breakdownPercentages);
  const riskFactors = generateRiskFactors(formData, breakdownPercentages);
  const summary = generateSummary(formData, totalCost, monthlyCost);
  
  return {
    totalCost,
    monthlyCost,
    breakdown,
    breakdownPercentages,
    recommendations,
    riskFactors,
    summary
  };
}

function generateRecommendations(formData: CostFormData, totalCost: number, breakdown: any): string[] {
  const recommendations: string[] = [];
  
  if (totalCost > 3000) {
    recommendations.push(RECOMMENDATIONS.highCost);
  }
  
  if (formData.complexityLevel === 'high') {
    recommendations.push(RECOMMENDATIONS.highComplexity);
  }
  
  if (formData.duration > 36) {
    recommendations.push(RECOMMENDATIONS.longDuration);
  }
  
  if (formData.teamSize === 'large') {
    recommendations.push(RECOMMENDATIONS.largeTeam);
  }
  
  if (formData.developmentPhase === 'clinical') {
    recommendations.push(RECOMMENDATIONS.clinical);
  }
  
  if (breakdown.regulatory > 35) {
    recommendations.push("Custos regulatórios representam mais de 35% do orçamento. Consultoria especializada pode identificar oportunidades de otimização.");
  }
  
  // Always add final recommendation
  recommendations.push("Para análise detalhada de otimização de custos e cenários alternativos, consulte nossos especialistas em Life Sciences.");
  
  return recommendations;
}

function generateRiskFactors(formData: CostFormData, breakdown: any): string[] {
  const riskFactors: string[] = [];
  
  if (formData.complexityLevel === 'high' && formData.developmentPhase === 'clinical') {
    riskFactors.push("Alto risco de estouro: Complexidade alta + Fase clínica");
  }
  
  if (formData.regulatoryMarkets.length > 2) {
    riskFactors.push("Múltiplas jurisdições aumentam complexidade regulatória");
  }
  
  if (breakdown.regulatory > 40) {
    riskFactors.push("Custos regulatórios acima da média do setor");
  }
  
  if (formData.duration > 48) {
    riskFactors.push("Projeto longo - maior exposição a mudanças regulatórias");
  }
  
  return riskFactors;
}

function generateSummary(formData: CostFormData, totalCost: number, monthlyCost: number): string {
  const productTypeText = formData.productType.replace(/_/g, ' ');
  const phaseText = formData.developmentPhase;
  
  return `Projeto de ${productTypeText} na fase de ${phaseText} com duração de ${formData.duration} meses. Custo total estimado: R$ ${(totalCost * 1000).toLocaleString('pt-BR')} (R$ ${(monthlyCost * 1000).toLocaleString('pt-BR')}/mês). Recomenda-se reserva de contingência de 15-20% para gestão de riscos.`;
}