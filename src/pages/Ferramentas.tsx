import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  Clock, 
  FlaskConical,
  Settings,
  BarChart3,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import ViabilityCalculator from '@/components/calculators/viability/ViabilityCalculator';
import CostCalculator from '@/components/calculators/cost/CostCalculator';
import RegulatoryRiskCalculator from '@/components/calculators/regulatory/RegulatoryRiskCalculator';
import QbDComplexityEvaluator from '@/components/calculators/qbd/QbDComplexityEvaluator';
import TimelineEstimator from '@/components/calculators/timeline/TimelineEstimator';
import DoEPlanner from '@/components/calculators/doe/DoEPlanner';
import ProcessRobustness from '@/components/calculators/process/ProcessRobustness';
import RSMOptimizer from '@/components/calculators/rsm/RSMOptimizer';
import ROICalculator from '@/components/calculators/roi/ROICalculator';

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'basic' | 'advanced' | 'premium';
  status: 'available' | 'coming-soon';
  features: string[];
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
}

const calculators: Calculator[] = [
  {
    id: 'viability',
    title: 'Calculadora de Viabilidade',
    description: 'Avalie a viabilidade do seu projeto considerando custos, tempo, mercado e complexidade regulatória.',
    icon: Calculator,
    category: 'basic',
    status: 'available',
    features: ['Análise Ponderada', 'Recomendações IA', 'Relatório Detalhado'],
    difficulty: 'Básico'
  },
  {
    id: 'cost',
    title: 'Calculadora de Custos',
    description: 'Estime custos de desenvolvimento, produção e regulatórios com base em benchmarks do setor.',
    icon: DollarSign,
    category: 'basic',
    status: 'available',
    features: ['Custos P&D', 'Análise Regulatória', 'ROI Projetado'],
    difficulty: 'Intermediário'
  },
  {
    id: 'regulatory-risk',
    title: 'Avaliador de Risco Regulatório',
    description: 'Identifique e quantifique riscos regulatórios para ANVISA, FDA e EMA.',
    icon: Shield,
    category: 'basic',
    status: 'available',
    features: ['Multi-jurisdições', 'Timeline Estimado', 'Fatores Críticos'],
    difficulty: 'Avançado'
  },
  {
    id: 'qbd-complexity',
    title: 'Avaliador de Complexidade QbD',
    description: 'Avalie a complexidade de implementação do Quality by Design no seu processo.',
    icon: Settings,
    category: 'advanced',
    status: 'available',
    features: ['Análise CQA', 'Risk Assessment', 'Design Space'],
    difficulty: 'Avançado'
  },
  {
    id: 'timeline',
    title: 'Estimador de Cronograma',
    description: 'Estime prazos realistas para desenvolvimento, estudos clínicos e aprovações.',
    icon: Clock,
    category: 'basic',
    status: 'available',
    features: ['Fases Clínicas', 'Marcos Regulatórios', 'Cenários Otimista/Pessimista'],
    difficulty: 'Intermediário'
  },
  {
    id: 'doe',
    title: 'Planejador DoE',
    description: 'Planeje experimentos otimizados com Design of Experiments para seu processo.',
    icon: FlaskConical,
    category: 'advanced',
    status: 'available',
    features: ['Screening Design', 'Response Surface', 'Otimização'],
    difficulty: 'Avançado'
  },
  {
    id: 'process-robustness',
    title: 'Análise de Robustez',
    description: 'Avalie a robustez do seu processo produtivo e identifique pontos críticos.',
    icon: TrendingUp,
    category: 'advanced',
    status: 'available',
    features: ['Análise CPP', 'Limites Operacionais', 'Risk Assessment'],
    difficulty: 'Avançado'
  },
  {
    id: 'rsm',
    title: 'Otimizador RSM',
    description: 'Otimize processos usando Response Surface Methodology com algoritmos avançados.',
    icon: BarChart3,
    category: 'premium',
    status: 'available',
    features: ['Modelo Preditivo', 'Otimização Multi-objetivo', 'Validação Estatística'],
    difficulty: 'Avançado'
  },
  {
    id: 'roi',
    title: 'ROI Farmacêutico',
    description: 'Calcule retorno sobre investimento e ponto de equilíbrio para projetos farmacêuticos.',
    icon: TrendingUp,
    category: 'basic',
    status: 'available',
    features: ['Projeção Fluxo de Caixa', 'Break-Even Point', 'Análise de Risco'],
    difficulty: 'Intermediário'
  }
];

const Ferramentas: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'viability':
        return <ViabilityCalculator />;
      case 'cost':
        return <CostCalculator />;
      case 'regulatory-risk':
        return <RegulatoryRiskCalculator />;
      case 'qbd-complexity':
        return <QbDComplexityEvaluator />;
      case 'timeline':
        return <TimelineEstimator />;
      case 'doe':
        return <DoEPlanner />;
      case 'process-robustness':
        return <ProcessRobustness />;
      case 'rsm':
        return <RSMOptimizer />;
      case 'roi':
        return <ROICalculator />;
      default:
        return null;
    }
  };

  if (activeCalculator) {
    const calculator = calculators.find(c => c.id === activeCalculator);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-elevated">
        <div className="container mx-auto px-6 py-8">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCalculator(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar às Ferramentas
            </Button>
            <div className="flex items-center gap-2">
              {calculator && (
                <>
                  <calculator.icon className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">{calculator.title}</h1>
                  <Badge variant="secondary">{calculator.difficulty}</Badge>
                </>
              )}
            </div>
          </div>

          {/* Calculator component */}
          {renderCalculator()}
        </div>
      </div>
    );
  }

  const basicCalculators = calculators.filter(c => c.category === 'basic');
  const advancedCalculators = calculators.filter(c => c.category === 'advanced');
  const premiumCalculators = calculators.filter(c => c.category === 'premium');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-elevated">
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Calculator className="h-12 w-12 text-primary" />
              <Sparkles className="h-5 w-5 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Ferramentas Interativas</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Calculadoras especializadas em Life Sciences para acelerar suas análises e decisões estratégicas.
            Desenvolvidas por especialistas da Essenza para maximizar a precisão dos seus projetos.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-surface-elevated/50 border border-border rounded-lg p-4 mb-8 mx-auto max-w-4xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Importante:</strong> Essas calculadoras fornecem estimativas baseadas em modelos matemáticos e dados do setor. 
                Os resultados devem ser utilizados como ferramenta de apoio à decisão e não substituem consultoria especializada. 
                Para análises detalhadas e personalizadas, recomendamos contato com nossos especialistas.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Calculators */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Calculadoras Essenciais</h2>
            <Badge variant="secondary">Gratuitas</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicCalculators.map((calculator) => (
              <Card key={calculator.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-surface-elevated/60 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <calculator.icon className="h-8 w-8 text-primary" />
                    <Badge variant="outline">{calculator.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-foreground">{calculator.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {calculator.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {calculator.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveCalculator(calculator.id)}
                    >
                      Usar Calculadora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Advanced Calculators */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-semibold text-foreground">Calculadoras Avançadas</h2>
            <Badge variant="secondary">Disponíveis</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedCalculators.map((calculator) => (
              <Card key={calculator.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-surface-elevated/60 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <calculator.icon className="h-8 w-8 text-accent" />
                    <Badge variant="outline">{calculator.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-foreground">{calculator.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {calculator.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {calculator.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveCalculator(calculator.id)}
                    >
                      Usar Calculadora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Premium Calculators */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-warning" />
            <h2 className="text-2xl font-semibold text-foreground">Calculadoras Premium</h2>
            <Badge variant="outline" className="border-warning text-warning">Premium</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumCalculators.map((calculator) => (
              <Card key={calculator.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-warning/20 bg-gradient-to-br from-surface-elevated/60 to-warning/5 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <calculator.icon className="h-8 w-8 text-warning" />
                    <Badge variant="outline" className="border-warning text-warning">{calculator.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-foreground">{calculator.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {calculator.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {calculator.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-foreground" 
                      onClick={() => setActiveCalculator(calculator.id)}
                    >
                      Usar Calculadora Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Precisa de uma análise mais aprofundada?
            </h3>
            <p className="text-muted-foreground mb-6">
              Nossas calculadoras são o primeiro passo. Para projetos complexos, oferecemos consultoria especializada 
              com análise documental avançada usando nossa plataforma de IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="/" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Análise Documental IA
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/library" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Explorar Biblioteca
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ferramentas;