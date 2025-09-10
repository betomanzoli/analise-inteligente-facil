export const PRODUCT_CATEGORIES = {
  pharmaceutical: 'Fármaco',
  medical_device: 'Dispositivo Médico',
  biological: 'Biológico', 
  food_supplement: 'Alimento/Suplemento',
  cosmetic: 'Cosmético'
} as const;

export const NOVELTY_DEGREES = {
  established: 'Tecnologia Estabelecida',
  incremental: 'Melhoria Incremental',
  pioneer: 'Tecnologia Pioneira'
} as const;

export const TARGET_MARKETS = {
  brazil: 'Brasil (ANVISA)',
  usa: 'Estados Unidos (FDA)',
  europe: 'Europa (EMA)',
  canada: 'Canadá (Health Canada)',
  japan: 'Japão (PMDA)'
} as const;

export const CLINICAL_EVIDENCE = {
  none: 'Nenhuma evidência necessária',
  literature: 'Dados da Literatura',
  pilot_study: 'Estudo Piloto',
  pivotal_studies: 'Estudos Pivotais Robustos'
} as const;

export const MITIGATION_FACTORS = {
  pre_submission_meeting: 'Reunião de pré-submissão realizada',
  expert_consulting: 'Consultoria especializada obtida',
  clear_predicate: 'Dispositivo predicado bem definido',
  accelerated_pathway: 'Qualifica para via acelerada',
  regulatory_precedent: 'Precedente regulatório favorável'
} as const;

// Risk scoring system (0-100 points)
export const RISK_SCORES = {
  base: {
    pharmaceutical: 40,
    medical_device: 25,
    biological: 45,
    food_supplement: 15,
    cosmetic: 10
  },
  novelty: {
    established: 5,
    incremental: 15,
    pioneer: 35
  },
  markets: {
    brazil: 12,
    usa: 18,
    europe: 16,
    canada: 14,
    japan: 20
  },
  evidence: {
    none: 0,
    literature: 8,
    pilot_study: 15,
    pivotal_studies: 25
  },
  mitigation: {
    pre_submission_meeting: -12,
    expert_consulting: -8,
    clear_predicate: -10,
    accelerated_pathway: -15,
    regulatory_precedent: -8
  }
} as const;

export const RECOMMENDATIONS = {
  high_risk: "Risco regulatório alto identificado. É fundamental desenvolver uma estratégia regulatória robusta desde o início para evitar atrasos e custos inesperados.",
  pioneer_technology: "A natureza pioneira do seu produto exigirá comunicação intensiva com as agências reguladoras. Reuniões de pré-submissão são altamente recomendadas.",
  multiple_markets: "Submissão em múltiplas jurisdições aumenta a complexidade. Considere uma estratégia de entrada escalonada, priorizando mercados-chave.",
  complex_evidence: "Estudos clínicos robustos são necessários. Planejamento estatístico adequado e consultoria regulatória podem otimizar custos e cronograma.",
  no_mitigation: "Nenhum fator de mitigação identificado. Consultoria regulatória especializada pode reduzir significativamente os riscos identificados.",
  consultation: "Para uma estratégia regulatória detalhada e personalizada, recomendamos consultoria com nossos especialistas em assuntos regulatórios."
} as const;