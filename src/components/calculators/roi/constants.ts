export const DISCOUNT_RATE = 0.12; // 12% discount rate for NPV calculation

export const RECOMMENDATIONS = {
  low_roi: "O ROI projetado está abaixo do benchmark da indústria farmacêutica (>300%). Reavalie as premissas de receita ou considere otimizações de custo.",
  long_break_even: "O tempo para break-even é longo (>8 anos). Estratégias que acelerem a entrada no mercado podem ser financeiramente vantajosas.",
  high_cogs: "COGS acima de 40% indica oportunidades de otimização na cadeia produtiva. Considere investimentos em eficiência operacional.",
  high_sgna: "Despesas SG&A elevadas (>35%) podem comprometer a rentabilidade. Avalie a eficiência dos investimentos em marketing e vendas.",
  short_patent: "Vida útil da patente limitada (<8 anos pós-lançamento) representa risco significativo. Considere estratégias de proteção intelectual complementares.",
  negative_npv: "Valor presente líquido negativo indica que o projeto pode não ser viável com a taxa de desconto atual. Reavalie premissas ou considere financiamento com custo menor.",
  consultation: "Para análises de sensibilidade detalhadas e modelagem de cenários, consulte nossos especialistas em valoração de projetos farmacêuticos."
} as const;

export const RISK_THRESHOLDS = {
  roi: {
    low: 500, // >500% ROI = low risk
    moderate: 200 // 200-500% = moderate, <200% = high risk
  },
  breakEven: {
    low: 5, // <5 years = low risk
    moderate: 8 // 5-8 years = moderate, >8 years = high risk
  },
  npv: {
    positive_threshold: 0 // NPV > 0 reduces risk
  }
} as const;