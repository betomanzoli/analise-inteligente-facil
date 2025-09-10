export interface ViabilityFormData {
  productType: string;
  developmentCost: string;
  timeToMarket: string;
  regulatoryComplexity: string;
  competitionLevel: string;
  marketSize: string;
}

export interface ViabilityScores {
  product: number;
  cost: number;
  time: number;
  regulatory: number;
  competition: number;
  market: number;
}

export interface ViabilityResult {
  percentage: number;
  level: 'Baixa' | 'Média' | 'Média-Alta' | 'Alta' | 'Muito Alta';
  color: string;
  icon: string;
  scores: ViabilityScores;
  recommendations: string[];
  summary: string;
}

export interface CalculatorAction {
  type: 'UPDATE_FIELD' | 'RESET_FORM';
  field?: keyof ViabilityFormData;
  value?: string;
}

export interface CalculatorState {
  formData: ViabilityFormData;
  isValid: boolean;
}