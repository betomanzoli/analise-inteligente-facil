import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  MessageCircle,
  FileText,
  LightBulb
} from 'lucide-react';
import { RegulatoryResult } from './types';

interface RegulatoryResultsProps {
  result: RegulatoryResult;
  onWhatsAppShare: () => void;
}

const RegulatoryResults: React.FC<RegulatoryResultsProps> = ({ result, onWhatsAppShare }) => {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Muito Baixo':
      case 'Baixo':
        return CheckCircle;
      case 'Moderado':
        return AlertTriangle;
      case 'Alto':
      case 'Muito Alto':
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'Muito Baixo':
      case 'Baixo':
        return 'bg-green-50 border-green-200';
      case 'Moderado':
        return 'bg-yellow-50 border-yellow-200';
      case 'Alto':
      case 'Muito Alto':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const RiskIcon = getRiskIcon(result.riskLevel);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Risk Summary Card */}
      <Card className={`${getRiskBgColor(result.riskLevel)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-warning" />
              <div>
                <CardTitle className="text-2xl text-foreground">Avaliação de Risco Regulatório</CardTitle>
                <CardDescription>Análise completa dos riscos identificados</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={`${result.riskColor} border-current`}>
              <RiskIcon className="h-3 w-3 mr-1" />
              {result.riskLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Score de Risco</p>
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-foreground">{result.riskScore}</p>
                <div className="text-sm text-muted-foreground">
                  <p>de 100 pontos</p>
                  <p className={result.riskColor}>Risco {result.riskLevel}</p>
                </div>
              </div>
              <Progress value={result.riskScore} className="h-2 mt-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Timeline Estimado</p>
              <div className="space-y-1">
                <p className="text-sm"><span className="font-medium">Otimista:</span> {result.estimatedTimeline.optimistic}</p>
                <p className="text-sm"><span className="font-medium">Realista:</span> {result.estimatedTimeline.realistic}</p>
                <p className="text-sm"><span className="font-medium">Pessimista:</span> {result.estimatedTimeline.pessimistic}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-accent" />
            <CardTitle>Breakdown da Pontuação</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Risco Base (Categoria)</span>
                <span>{result.scoreBreakdown.base} pts</span>
              </div>
              <Progress value={(result.scoreBreakdown.base / 50) * 100} className="h-1" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Grau de Novidade</span>
                <span>{result.scoreBreakdown.novelty} pts</span>
              </div>
              <Progress value={(result.scoreBreakdown.novelty / 35) * 100} className="h-1" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Múltiplos Mercados</span>
                <span>{result.scoreBreakdown.markets} pts</span>
              </div>
              <Progress value={(result.scoreBreakdown.markets / 60) * 100} className="h-1" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Evidência Clínica</span>
                <span>{result.scoreBreakdown.evidence} pts</span>
              </div>
              <Progress value={(result.scoreBreakdown.evidence / 25) * 100} className="h-1" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between text-sm">
                <span>Fatores de Mitigação</span>
                <span className="text-green-600">{result.scoreBreakdown.mitigation} pts</span>
              </div>
              <Progress value={Math.abs(result.scoreBreakdown.mitigation / 50) * 100} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Factors */}
      {result.criticalFactors.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-orange-900">Fatores Críticos de Risco</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.criticalFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  {factor}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Mitigation Opportunities */}
      {result.mitigationOpportunities.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-blue-900">Oportunidades de Mitigação</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.mitigationOpportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  {opportunity}
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
          Consultar Especialista Regulatório
        </Button>
        <Button className="flex-1" variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>
    </div>
  );
};

export default RegulatoryResults;