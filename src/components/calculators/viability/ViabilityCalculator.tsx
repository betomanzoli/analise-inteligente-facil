import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calculator, AlertTriangle, Info } from 'lucide-react';
import { useViabilityCalculator } from './useViabilityCalculator';
import { calculateViability } from './viabilityCalculations';
import { ViabilityForm } from './ViabilityForm';
import { ViabilityResults } from './ViabilityResults';
import type { ViabilityResult } from './types';

const ViabilityCalculator: React.FC = () => {
  const { formData, isFormValid, updateField, resetForm } = useViabilityCalculator();
  const [result, setResult] = useState<ViabilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!isFormValid) return;

    setIsCalculating(true);
    
    try {
      // Simular processamento com delay para UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const calculatedResult = calculateViability(formData);
      setResult(calculatedResult);
    } catch (error) {
      console.error('Erro no cálculo de viabilidade:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl text-foreground">Calculadora de Viabilidade</CardTitle>
              <CardDescription>
                Avalie a viabilidade do seu projeto considerando múltiplos fatores críticos para o sucesso
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Disclaimer */}
      <div className="bg-surface-elevated/50 border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> Esta calculadora fornece estimativas baseadas em modelos matemáticos. 
              Os resultados devem ser utilizados como ferramenta de apoio à tomada de decisão e não substituem análise detalhada por especialistas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Dados do Projeto
            </CardTitle>
            <CardDescription>
              Preencha as informações sobre seu projeto para calcular a viabilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ViabilityForm formData={formData} onFieldChange={updateField} />
            
            <Separator />
            
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleCalculate}
                disabled={!isFormValid || isCalculating}
                className="min-w-[200px]"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Viabilidade
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ViabilityResults 
          result={result} 
          formData={formData} 
          onNewAnalysis={handleNewAnalysis}
        />
      )}

      {/* Methodology */}
      <Card className="bg-surface-elevated/30">
        <CardHeader>
          <CardTitle className="text-lg">Como Calculamos?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Fatores Avaliados:</h4>
              <ul className="space-y-1">
                <li>• <span className="font-medium">Tipo de Produto</span> (20%)</li>
                <li>• <span className="font-medium">Tamanho do Mercado</span> (22%)</li>
                <li>• <span className="font-medium">Custos de Desenvolvimento</span> (18%)</li>
                <li>• <span className="font-medium">Tempo para Mercado</span> (15%)</li>
                <li>• <span className="font-medium">Nível de Competição</span> (15%)</li>
                <li>• <span className="font-medium">Complexidade Regulatória</span> (10%)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Metodologia:</h4>
              <p>
                Utilizamos um algoritmo de pontuação ponderada baseado em dados históricos do setor de Life Sciences. 
                Cada fator recebe uma pontuação de 0-100, que é multiplicada pelo seu peso respectivo para gerar 
                o score final de viabilidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViabilityCalculator;