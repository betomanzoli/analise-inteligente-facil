import React from 'react';
import { Calculator, TrendingUp, Shield, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import ViabilityCalculator from '@/components/calculators/viability/ViabilityCalculator';
import { useState } from 'react';

export default function Tools() {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const calculators = [
    {
      id: 'viability',
      title: 'Calculadora de Viabilidade',
      description: 'Analise a viabilidade técnica e comercial de projetos em Life Sciences',
      icon: Calculator,
      available: true,
      category: 'Estratégia',
      features: ['Análise de custos', 'Tempo de mercado', 'Riscos regulatórios', 'Recomendações IA']
    },
    {
      id: 'costs',
      title: 'Calculadora de Custos',
      description: 'Estime custos de desenvolvimento, produção e regulamentação',
      icon: TrendingUp,
      available: false,
      category: 'Financeiro',
      features: ['P&D', 'Produção', 'Regulamentação', 'Distribuição']
    },
    {
      id: 'regulatory',
      title: 'Análise de Risco Regulatório',
      description: 'Avalie riscos de conformidade com ANVISA, FDA e EMA',
      icon: Shield,
      available: false,
      category: 'Regulatório',
      features: ['ANVISA', 'FDA', 'EMA', 'Cronograma']
    },
    {
      id: 'timeline',
      title: 'Calculadora de Cronograma',
      description: 'Projete cronogramas realistas para desenvolvimento e aprovação',
      icon: Clock,
      available: false,
      category: 'Planejamento',
      features: ['Fases clínicas', 'Aprovações', 'Marcos críticos', 'Buffers']
    }
  ];

  if (activeCalculator === 'viability') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={() => setActiveCalculator(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Voltar às Ferramentas
              </Button>
            </div>
            <ViabilityCalculator />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-hero">Ferramentas Inteligentes</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Calculadoras especializadas para acelerar suas decisões em projetos de Life Sciences.
              Baseadas em dados reais do mercado e regulamentações atuais.
            </p>
          </section>

          {/* Calculadoras Disponíveis */}
          <section className="mb-12">
            <h2 className="text-section-title mb-6 text-center">Calculadoras Disponíveis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {calculators.filter(calc => calc.available).map((calculator) => (
                <Card key={calculator.id} className="group cursor-pointer interactive-hover border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <calculator.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-card-title">{calculator.title}</CardTitle>
                          <Badge variant="secondary" className="mt-1">{calculator.category}</Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardDescription className="mt-2">
                      {calculator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {calculator.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
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

          {/* Em Breve */}
          <section>
            <h2 className="text-section-title mb-6 text-center text-muted-foreground">Em Breve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculators.filter(calc => !calc.available).map((calculator) => (
                <Card key={calculator.id} className="opacity-60 border-dashed">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <calculator.icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-card-title text-muted-foreground">{calculator.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{calculator.category}</Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {calculator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {calculator.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs opacity-60">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full" disabled>
                      Em Desenvolvimento
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="mt-16 text-center">
            <Card className="bg-gradient-primary text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Integração Total com Análise Documental
                </h3>
                <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                  Suas calculadoras trabalham em conjunto com o sistema de análise de documentos,
                  criando um ecossistema completo de inteligência para Life Sciences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="secondary" size="lg" asChild>
                    <a href="/">Analisar Documentos</a>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Falar com Especialista
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}