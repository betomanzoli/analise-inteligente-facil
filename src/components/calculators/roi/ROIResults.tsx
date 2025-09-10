import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  FileText,
  BarChart3
} from 'lucide-react';
import { ROIResult } from './types';

interface ROIResultsProps {
  result: ROIResult;
  onWhatsAppShare: () => void;
}

const ROIResults: React.FC<ROIResultsProps> = ({ result, onWhatsAppShare }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value * 1000);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Baixo': return 'text-green-600 border-green-200 bg-green-50';
      case 'Moderado': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'Alto': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Baixo': return CheckCircle;
      case 'Moderado': return AlertTriangle;
      case 'Alto': return AlertTriangle;
      default: return Target;
    }
  };

  const RiskIcon = getRiskIcon(result.riskLevel);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">ROI</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{formatPercentage(result.roi)}</p>
            <p className="text-sm text-muted-foreground">Retorno sobre Investimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Break-Even</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {result.breakEvenYear ? `${result.breakEvenYear} anos` : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Ponto de Equilíbrio</p>
          </CardContent>
        </Card>

        <Card className={getRiskColor(result.riskLevel)}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <RiskIcon className="h-5 w-5" />
              <CardTitle className="text-base">Risco</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{result.riskLevel}</p>
            <p className="text-sm opacity-70">Avaliação de Risco</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <CardTitle>Métricas Financeiras</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lucro Total</p>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result.totalProfit)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">VPL</p>
              <p className={`text-lg font-semibold ${result.netPresentValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(result.netPresentValue)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Receita Pico</p>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result.keyMetrics.peakRevenue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Margem Lucro</p>
              <p className="text-lg font-semibold text-foreground">{formatPercentage(result.keyMetrics.profitMargin)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Chart Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-accent" />
            <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Primeiros 5 anos pós-lançamento</span>
              <span>Valores em R$ milhares</span>
            </div>
            
            {/* Simple text-based chart for first 5 years */}
            <div className="space-y-2">
              {result.cashFlowProjections.slice(0, 5).map((projection, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <span className="text-sm font-medium">Ano {projection.year}</span>
                  <div className="flex gap-4 text-sm">
                    <span>Receita: {formatCurrency(projection.revenue)}</span>
                    <span>Lucro: {formatCurrency(projection.profit)}</span>
                    <span className={`font-medium ${projection.cumulativeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Acum: {formatCurrency(projection.cumulativeProfit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground">
              * Projeção completa ({result.cashFlowProjections.length} anos) disponível no relatório detalhado
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>Recomendações Estratégicas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-surface-elevated/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <CardTitle>Resumo Executivo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {result.summary}
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onWhatsAppShare} className="flex-1" variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Validar Projeções com Especialista
        </Button>
        <Button className="flex-1" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório Detalhado
        </Button>
      </div>
    </div>
  );
};

export default ROIResults;