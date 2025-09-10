import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, BarChart3 } from 'lucide-react';

const RegulatoryRiskCalculator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-warning" />
            <div>
              <CardTitle className="text-2xl text-foreground">Avaliador de Risco Regulatório</CardTitle>
              <CardDescription>
                Identifique e quantifique riscos regulatórios para ANVISA, FDA e EMA
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
              <strong className="text-foreground">Em Desenvolvimento:</strong> Esta calculadora está sendo desenvolvida 
              com expertise regulatória para avaliar riscos em múltiplas jurisdições (Brasil, EUA, Europa).
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
            Nossa equipe está criando algoritmos que avaliarão: complexidade regulatória, 
            timeline de aprovação, documentação necessária e estratégias de mitigação de riscos.
          </p>
          <Button disabled>
            <Shield className="h-4 w-4 mr-2" />
            Em Breve
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatoryRiskCalculator;