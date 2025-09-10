import React, { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ViabilityForm } from './ViabilityForm';
import { ViabilityResults } from './ViabilityResults';
import { useViabilityCalculator } from './useViabilityCalculator';
import { calculateViability } from './viabilityCalculations';
import { ViabilityResult } from './types';

export function ViabilityCalculator() {
  const { formData, isFormValid, updateField, resetForm } = useViabilityCalculator();
  const [result, setResult] = useState<ViabilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!isFormValid) return;

    setIsCalculating(true);
    
    // Simular processamento (para melhor UX)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const calculationResult = calculateViability(formData);
      setResult(calculationResult);
    } catch (error) {
      console.error('Erro no cálculo:', error);
      // Em caso de erro, mostrar resultado padrão
      setResult({
        percentage: 0,
        level: 'Baixa',
        color: 'text-destructive',
        icon: '❌',
        scores: {
          product: 0,
          cost: 0,
          time: 0,
          regulatory: 0,
          competition: 0,
          market: 0,
        },
        recommendations: ['Erro no cálculo. Tente novamente ou entre em contato com suporte.'],
        summary: 'Houve um erro no processamento da análise.',
      });
    }
    
    setIsCalculating(false);
  };

  const handleNewAnalysis = () => {
    setResult(null);
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-hero">Calculadora de Viabilidade</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Analise a viabilidade técnica e comercial do seu projeto em Life Sciences.
          Nossa metodologia considera fatores críticos como custos, regulamentação e dinâmica de mercado.
        </p>
      </div>

      {/* Disclaimer */}
      <Alert>
        <AlertDescription>
          <strong>Importante:</strong> Esta calculadora fornece estimativas baseadas em dados informados 
          e metodologia proprietária. Os resultados devem ser complementados com análise detalhada de 
          especialistas em Life Sciences.
        </AlertDescription>
      </Alert>

      {/* Formulário ou Resultados */}
      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Projeto</CardTitle>
            <CardDescription>
              Preencha as informações sobre seu projeto para obter a análise de viabilidade
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <ViabilityForm 
              formData={formData} 
              onFieldChange={updateField}
            />
            
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleCalculate}
                disabled={!isFormValid || isCalculating}
                className="flex-1"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Viabilidade
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={isCalculating}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
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

      {/* Como Calculamos */}
      <Card className="bg-surface-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Como Calculamos?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Nossa metodologia utiliza <strong>pesos ponderados</strong> para cada fator de viabilidade:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Custos (25%)</strong> - Impacto financeiro do desenvolvimento</li>
            <li><strong>Tipo de Produto (20%)</strong> - Complexidade e potencial de inovação</li>
            <li><strong>Tempo (20%)</strong> - Janela de oportunidade de mercado</li>
            <li><strong>Regulatório (15%)</strong> - Complexidade de aprovações</li>
            <li><strong>Competição (10%)</strong> - Intensidade competitiva</li>
            <li><strong>Mercado (10%)</strong> - Tamanho e potencial do mercado</li>
          </ul>
          <p className="pt-2">
            O resultado final combina todos os fatores em uma pontuação de 0-100%, 
            acompanhada de recomendações específicas baseadas no perfil do seu projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}