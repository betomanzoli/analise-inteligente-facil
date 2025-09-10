import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, AlertTriangle, BarChart3 } from 'lucide-react';

const QbDComplexityEvaluator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl text-foreground">Avaliador de Complexidade QbD</CardTitle>
              <CardDescription>
                Avalie a complexidade de implementação do Quality by Design no seu processo
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
              <strong className="text-foreground">Em Desenvolvimento:</strong> Esta calculadora especializada 
              está sendo desenvolvida para avaliar a complexidade de implementação de QbD em processos farmacêuticos.
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
            Nossa equipe está criando algoritmos que avaliarão: análise de CQA, 
            risk assessment, design space, controles de processo e estratégias de validação.
          </p>
          <Button disabled>
            <Settings className="h-4 w-4 mr-2" />
            Em Breve
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QbDComplexityEvaluator;