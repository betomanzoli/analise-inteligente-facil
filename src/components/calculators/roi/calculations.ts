import { ROIFormData, ROIResult, CashFlowProjection } from './types';
import { DISCOUNT_RATE, RECOMMENDATIONS, RISK_THRESHOLDS } from './constants';

export function calculateROI(formData: ROIFormData): ROIResult {
  const {
    totalInvestment,
    marketLaunchYear,
    patentExpiryYear,
    peakAnnualSales,
    yearsToPeakSales,
    cogsPercentage,
    sgnaPercentage
  } = formData;

  // Calculate key metrics
  const patentLife = patentExpiryYear - marketLaunchYear;
  const netProfitMargin = (100 - cogsPercentage - sgnaPercentage) / 100;
  const analysisYears = patentLife + 5; // Analyze 5 years post-patent
  
  // Generate cash flow projections
  const cashFlowProjections: CashFlowProjection[] = [];
  let cumulativeProfit = -totalInvestment; // Start with initial investment as negative
  let breakEvenYear: number | null = null;
  
  for (let year = 1; year <= analysisYears; year++) {
    const revenue = calculateRevenue(year, yearsToPeakSales, peakAnnualSales, patentLife);
    const profit = revenue * netProfitMargin;
    
    cumulativeProfit += profit;
    
    // Check for break-even point
    if (breakEvenYear === null && cumulativeProfit > 0) {
      breakEvenYear = year;
    }
    
    cashFlowProjections.push({
      year,
      revenue,
      profit,
      cumulativeProfit
    });
  }
  
  // Calculate final metrics
  const totalProfit = cashFlowProjections.reduce((sum, projection) => sum + projection.profit, 0);
  const roi = ((totalProfit - totalInvestment) / totalInvestment) * 100;
  
  // Calculate NPV
  const netPresentValue = calculateNPV(cashFlowProjections, totalInvestment, DISCOUNT_RATE);
  
  // Determine risk level
  const riskLevel = determineRiskLevel(roi, breakEvenYear, netPresentValue);
  
  // Generate recommendations
  const recommendations = generateRecommendations(formData, roi, breakEvenYear, netPresentValue);
  
  // Generate summary
  const summary = generateSummary(formData, roi, breakEvenYear, totalProfit);
  
  return {
    roi,
    breakEvenYear,
    totalProfit,
    netPresentValue,
    cashFlowProjections,
    riskLevel,
    recommendations,
    summary,
    keyMetrics: {
      peakRevenue: peakAnnualSales,
      averageAnnualProfit: totalProfit / analysisYears,
      profitMargin: netProfitMargin * 100,
      patentLife
    }
  };
}

function calculateRevenue(
  year: number, 
  yearsToPeak: number, 
  peakSales: number, 
  patentLife: number
): number {
  if (year <= yearsToPeak) {
    // Linear ramp-up to peak
    return (peakSales / yearsToPeak) * year;
  } else if (year <= patentLife) {
    // Maintain peak sales during patent protection
    return peakSales;
  } else {
    // Post-patent decline (generic competition)
    const postPatentYears = year - patentLife;
    const declineRate = 0.3; // 30% decline per year post-patent
    return peakSales * Math.pow(1 - declineRate, postPatentYears);
  }
}

function calculateNPV(
  cashFlows: CashFlowProjection[], 
  initialInvestment: number, 
  discountRate: number
): number {
  const presentValueOfCashFlows = cashFlows.reduce((npv, projection) => {
    const presentValue = projection.profit / Math.pow(1 + discountRate, projection.year);
    return npv + presentValue;
  }, 0);
  
  return presentValueOfCashFlows - initialInvestment;
}

function determineRiskLevel(
  roi: number, 
  breakEvenYear: number | null, 
  npv: number
): 'Baixo' | 'Moderado' | 'Alto' {
  let riskScore = 0;
  
  // ROI risk scoring
  if (roi >= RISK_THRESHOLDS.roi.low) riskScore -= 2;
  else if (roi >= RISK_THRESHOLDS.roi.moderate) riskScore -= 1;
  else riskScore += 2;
  
  // Break-even risk scoring
  if (breakEvenYear === null) riskScore += 3;
  else if (breakEvenYear <= RISK_THRESHOLDS.breakEven.low) riskScore -= 1;
  else if (breakEvenYear <= RISK_THRESHOLDS.breakEven.moderate) riskScore += 0;
  else riskScore += 2;
  
  // NPV risk scoring
  if (npv > 0) riskScore -= 1;
  else riskScore += 2;
  
  if (riskScore <= -1) return 'Baixo';
  if (riskScore <= 2) return 'Moderado';
  return 'Alto';
}

function generateRecommendations(
  formData: ROIFormData,
  roi: number,
  breakEvenYear: number | null,
  npv: number
): string[] {
  const recommendations: string[] = [];
  
  if (roi < RISK_THRESHOLDS.roi.moderate) {
    recommendations.push(RECOMMENDATIONS.low_roi);
  }
  
  if (breakEvenYear === null || breakEvenYear > RISK_THRESHOLDS.breakEven.moderate) {
    recommendations.push(RECOMMENDATIONS.long_break_even);
  }
  
  if (formData.cogsPercentage > 40) {
    recommendations.push(RECOMMENDATIONS.high_cogs);
  }
  
  if (formData.sgnaPercentage > 35) {
    recommendations.push(RECOMMENDATIONS.high_sgna);
  }
  
  if ((formData.patentExpiryYear - formData.marketLaunchYear) < 8) {
    recommendations.push(RECOMMENDATIONS.short_patent);
  }
  
  if (npv < 0) {
    recommendations.push(RECOMMENDATIONS.negative_npv);
  }
  
  // Always add consultation recommendation
  recommendations.push(RECOMMENDATIONS.consultation);
  
  return recommendations;
}

function generateSummary(
  formData: ROIFormData,
  roi: number,
  breakEvenYear: number | null,
  totalProfit: number
): string {
  const breakEvenText = breakEvenYear ? `${breakEvenYear} anos` : 'não atingido no período analisado';
  const profitText = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 0 
  }).format(totalProfit * 1000);
  
  return `Projeto farmacêutico com investimento inicial de R$ ${(formData.totalInvestment * 1000).toLocaleString('pt-BR')} e lançamento previsto para ${formData.marketLaunchYear}. ROI projetado de ${roi.toFixed(1)}% com break-even em ${breakEvenText}. Lucro total estimado: ${profitText} ao longo do período de análise.`;
}