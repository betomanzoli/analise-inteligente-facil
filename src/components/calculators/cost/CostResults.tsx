import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  PieChart,
  Calculator,
  MessageCircle,
  FileText
} from 'lucide-react';
import { CostResult } from './types';

interface CostResultsProps {
  result: CostResult;
  onWhatsAppShare: () => void;
}

const CostResults: React.FC<CostResultsProps> = ({ result, onWhatsAppShare }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value * 1000); // Convert from thousands
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getCostLevelInfo = (totalCost: number) => {
    if (totalCost < 500) {
      return { level: 'Baixo', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    } else if (totalCost < 2000) {
      return { level: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertTriangle };
    } else {
      return { level: 'Alto', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
    }
  };

  const costLevel = getCostLevelInfo(result.totalCost);
  const Icon = costLevel.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl text-foreground">Estimativa de Custos</CardTitle>
                <CardDescription>Análise detalhada do seu projeto</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={`${costLevel.color} border-current`}>
              <Icon className="h-3 w-3 mr-1" />
              Custo {costLevel.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Custo Total Estimado</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(result.totalCost)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Custo Mensal Médio</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(result.monthlyCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <PieChart className="h-6 w-6 text-accent" />
            <CardTitle>Breakdown de Custos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Development Costs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Desenvolvimento</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(result.breakdown.development)} ({formatPercentage(result.breakdownPercentages.development)})
              </span>
            </div>
            <Progress value={result.breakdownPercentages.development} className="h-2" />
          </div>

          {/* Regulatory Costs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Regulatório</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(result.breakdown.regulatory)} ({formatPercentage(result.breakdownPercentages.regulatory)})
              </span>
            </div>
            <Progress value={result.breakdownPercentages.regulatory} className="h-2" />
          </div>

          {/* Quality Costs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Qualidade</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(result.breakdown.quality)} ({formatPercentage(result.breakdownPercentages.quality)})
              </span>
            </div>
            <Progress value={result.breakdownPercentages.quality} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {result.riskFactors.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-orange-900">Fatores de Risco</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  {factor}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Recomendações Inteligentes</CardTitle>
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
          Consultar Especialista
        </Button>
        <Button className="flex-1" variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </div>
    </div>
  );
};

export default CostResults;