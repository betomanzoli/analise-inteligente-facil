import { z } from 'zod';

export const ROIFormSchema = z.object({
  totalInvestment: z.number().min(1),
  marketLaunchYear: z.number().min(new Date().getFullYear()),
  patentExpiryYear: z.number(),
  peakAnnualSales: z.number().min(1),
  yearsToPeakSales: z.number().min(1).max(15),
  cogsPercentage: z.number().min(5).max(80),
  sgnaPercentage: z.number().min(5).max(60)
}).refine(
  (data) => data.patentExpiryYear > data.marketLaunchYear,
  {
    message: "Ano de expiração deve ser posterior ao lançamento",
    path: ["patentExpiryYear"],
  }
);

export type ROIFormData = z.infer<typeof ROIFormSchema>;

export interface CashFlowProjection {
  year: number;
  revenue: number;
  profit: number;
  cumulativeProfit: number;
}

export interface ROIResult {
  roi: number;
  breakEvenYear: number | null;
  totalProfit: number;
  netPresentValue: number;
  cashFlowProjections: CashFlowProjection[];
  riskLevel: 'Baixo' | 'Moderado' | 'Alto';
  recommendations: string[];
  summary: string;
  keyMetrics: {
    peakRevenue: number;
    averageAnnualProfit: number;
    profitMargin: number;
    patentLife: number;
  };
}