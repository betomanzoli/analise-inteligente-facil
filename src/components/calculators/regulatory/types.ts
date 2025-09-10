import { z } from 'zod';

export const RegulatoryFormSchema = z.object({
  productCategory: z.enum(['pharmaceutical', 'medical_device', 'biological', 'food_supplement', 'cosmetic']),
  noveltyDegree: z.enum(['established', 'incremental', 'pioneer']),
  targetMarkets: z.array(z.enum(['brazil', 'usa', 'europe', 'canada', 'japan'])).min(1),
  clinicalEvidence: z.enum(['none', 'literature', 'pilot_study', 'pivotal_studies']),
  mitigationFactors: z.array(z.enum(['pre_submission_meeting', 'expert_consulting', 'clear_predicate', 'accelerated_pathway', 'regulatory_precedent'])).optional().default([]),
  hasRegulatoryExpertise: z.boolean().optional().default(false),
  timelineImportance: z.enum(['low', 'medium', 'high']).optional().default('medium')
});

export type RegulatoryFormData = z.infer<typeof RegulatoryFormSchema>;

export interface RegulatoryResult {
  riskScore: number;
  riskLevel: 'Muito Baixo' | 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto';
  riskColor: string;
  criticalFactors: string[];
  mitigationOpportunities: string[];
  estimatedTimeline: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
  };
  recommendations: string[];
  summary: string;
  scoreBreakdown: {
    base: number;
    novelty: number;
    markets: number;
    evidence: number;
    mitigation: number;
  };
}