import { z } from 'zod';

export const CostFormSchema = z.object({
  productType: z.enum(['pharmaceutical_innovator', 'pharmaceutical_generic', 'medical_device_class_I_II', 'medical_device_class_III', 'biological', 'cosmetic']),
  developmentPhase: z.enum(['research', 'development', 'clinical', 'registration']),
  complexityLevel: z.enum(['low', 'medium', 'high']),
  teamSize: z.enum(['small', 'medium', 'large']),
  duration: z.number().min(1).max(120),
  requiresClinicalStudy: z.boolean().optional(),
  regulatoryMarkets: z.array(z.enum(['brazil', 'usa', 'europe'])).min(1)
});

export type CostFormData = z.infer<typeof CostFormSchema>;

export interface CostBreakdown {
  development: number;
  regulatory: number;
  quality: number;
}

export interface CostResult {
  totalCost: number;
  monthlyCost: number;
  breakdown: CostBreakdown;
  breakdownPercentages: {
    development: number;
    regulatory: number;
    quality: number;
  };
  recommendations: string[];
  riskFactors: string[];
  summary: string;
}