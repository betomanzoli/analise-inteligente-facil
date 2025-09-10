import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';

const CostCalculator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-accent" />
            <div>
              <CardTitle className="text-2xl text-foreground">Calculadora de Custos</CardTitle>
              <CardDescription>
                Estime custos de desenvolvimento, produção e regulatórios com base em benchmarks do setor
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="bg-surface-elevated/50 border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Em Desenvolvimento:</strong> Esta calculadora está sendo finalizada 
              com algoritmos avançados baseados em dados reais do mercado de Life Sciences.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Calculadora em Desenvolvimento
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Nossa equipe está finalizando esta ferramenta com algoritmos que considerarão:
            custos de P&D, produção, regulatórios, recursos humanos e timeline específicos para Life Sciences.
          </p>
          <Button disabled>
            <DollarSign className="h-4 w-4 mr-2" />
            Em Breve
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculator;