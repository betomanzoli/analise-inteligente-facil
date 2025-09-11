import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  Lightbulb,
  BookOpen,
  BarChart3
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  type: string;
  title: string;
  executiveSummary: {
    verdict: string;
    confidenceLevel: 'Alto' | 'Médio' | 'Baixo';
    keyInsights: string[];
  };
  detailedAnalysis: {
    sections: Array<{
      title: string;
      content: string;
      findings: string[];
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  riskAssessment: {
    high: string[];
    medium: string[];
    low: string[];
  };
  roiMetrics?: {
    estimatedSavings: string;
    timeReduction: string;
    riskMitigation: string;
  };
  sources: string[];
  generatedAt: string;
}

interface ProfessionalReportViewerProps {
  result: AnalysisResult;
  onExport?: (format: 'pdf' | 'word' | 'excel') => void;
  onShare?: () => void;
}

const ProfessionalReportViewer: React.FC<ProfessionalReportViewerProps> = ({
  result,
  onExport,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'recommendations' | 'metrics'>('summary');

  const getConfidenceLevelColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'text-green-600 bg-green-50 border-green-200';
      case 'Médio': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Baixo': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const TabButton: React.FC<{ 
    tab: typeof activeTab; 
    label: string; 
    icon: React.ComponentType<any> 
  }> = ({ tab, label, icon: Icon }) => (
    <Button
      variant={activeTab === tab ? 'default' : 'outline'}
      onClick={() => setActiveTab(tab)}
      className="flex items-center gap-2"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">
                  {result.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span>ID: {result.id}</span>
                  <span>•</span>
                  <span>Gerado em {new Date(result.generatedAt).toLocaleString('pt-BR')}</span>
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton tab="summary" label="Resumo Executivo" icon={Target} />
        <TabButton tab="detailed" label="Análise Detalhada" icon={BookOpen} />
        <TabButton tab="recommendations" label="Recomendações" icon={Lightbulb} />
        <TabButton tab="metrics" label="Métricas & ROI" icon={BarChart3} />
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Resumo Executivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-surface-elevated rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Veredito Principal</span>
                  </div>
                  <p className="text-foreground font-medium">{result.executiveSummary.verdict}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Nível de Confiança:</span>
                  <Badge className={getConfidenceLevelColor(result.executiveSummary.confidenceLevel)}>
                    {result.executiveSummary.confidenceLevel}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Principais Insights:</h4>
                  <ul className="space-y-2">
                    {result.executiveSummary.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Avaliação de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(['high', 'medium', 'low'] as const).map((level) => {
                  const risks = result.riskAssessment[level];
                  if (risks.length === 0) return null;
                  
                  const levelLabels = { high: 'Alto', medium: 'Médio', low: 'Baixo' };
                  
                  return (
                    <div key={level} className="space-y-2">
                      <Badge className={getRiskLevelColor(level)}>
                        Risco {levelLabels[level]}
                      </Badge>
                      <ul className="space-y-1 ml-4">
                        {risks.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {result.detailedAnalysis.sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{section.content}</p>
                  {section.findings.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Principais Descobertas:</h5>
                      <ul className="space-y-1">
                        {section.findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {(['immediate', 'shortTerm', 'longTerm'] as const).map((timeframe) => {
              const recommendations = result.recommendations[timeframe];
              if (recommendations.length === 0) return null;
              
              const timeframeLabels = {
                immediate: 'Ações Imediatas (0-30 dias)',
                shortTerm: 'Prazo Curto (1-6 meses)', 
                longTerm: 'Prazo Longo (6+ meses)'
              };
              
              const timeframeIcons = {
                immediate: Clock,
                shortTerm: TrendingUp,
                longTerm: Target
              };
              
              const Icon = timeframeIcons[timeframe];
              
              return (
                <Card key={timeframe}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {timeframeLabels[timeframe]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg">
                          <div className="p-1 bg-primary/20 rounded-full mt-0.5">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          </div>
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'metrics' && result.roiMetrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">Economia Estimada</p>
                  <p className="text-2xl font-bold text-green-700">{result.roiMetrics.estimatedSavings}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">Redução de Tempo</p>
                  <p className="text-2xl font-bold text-blue-700">{result.roiMetrics.timeReduction}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-600 font-medium">Mitigação de Risco</p>
                  <p className="text-2xl font-bold text-purple-700">{result.roiMetrics.riskMitigation}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Card className="bg-surface-elevated">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Baseado em {result.sources.length} fonte(s) de dados</span>
            <span>Relatório gerado pela Plataforma de Análise Farmacêutica Essenza</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalReportViewer;