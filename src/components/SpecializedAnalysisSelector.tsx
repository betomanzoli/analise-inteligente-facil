import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Sparkles, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface AnalysisType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  estimatedTime: string;
  complexity: 'Básico' | 'Intermediário' | 'Avançado';
  price: string;
  recommended?: boolean;
}

interface SpecializedAnalysisSelectorProps {
  detectedType: string;
  onAnalysisSelect: (analysisId: string) => void;
}

const SpecializedAnalysisSelector: React.FC<SpecializedAnalysisSelectorProps> = ({
  detectedType,
  onAnalysisSelect
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');

  const analysisTypes: AnalysisType[] = [
    {
      id: 'regulatory-compliance',
      title: 'Análise Regulatória ANVISA/FDA',
      description: 'Verificação de compliance com diretrizes regulatórias e identificação de lacunas',
      icon: Shield,
      features: ['Compliance Check', 'Gap Analysis', 'Timeline Estimado', 'Ações Corretivas'],
      estimatedTime: '3-5 min',
      complexity: 'Avançado',
      price: 'R$ 25',
      recommended: detectedType.includes('regulatory')
    },
    {
      id: 'formulation-optimization',
      title: 'Otimização de Formulação',
      description: 'Análise técnica para melhoria de fórmulas e identificação de oportunidades',
      icon: Sparkles,
      features: ['Análise de Excipientes', 'Sugestões de Melhoria', 'Compatibilidade', 'Estabilidade'],
      estimatedTime: '4-6 min',
      complexity: 'Avançado',
      price: 'R$ 35',
      recommended: detectedType.includes('formulation')
    },
    {
      id: 'costing-analysis',
      title: 'Análise de Custeio Inteligente',
      description: 'Breakdown de custos, margem e precificação competitiva baseada em dados de mercado',
      icon: DollarSign,
      features: ['Custo por Componente', 'Análise de Margem', 'Benchmarking', 'ROI Estimado'],
      estimatedTime: '2-3 min',
      complexity: 'Intermediário',
      price: '8% do valor',
      recommended: detectedType.includes('costing')
    },
    {
      id: 'literature-extraction',
      title: 'Extração de Literatura Técnica',
      description: 'Identificação e síntese de insights científicos relevantes para tomada de decisão',
      icon: FileText,
      features: ['Key Insights', 'Evidências Científicas', 'Recomendações', 'Bibliografia'],
      estimatedTime: '3-4 min',
      complexity: 'Intermediário',
      price: 'R$ 20',
      recommended: detectedType.includes('literature')
    },
    {
      id: 'equivalence-analysis',
      title: 'Análise de Equivalência Farmacêutica',
      description: 'Comparação detalhada vs medicamento de referência e avaliação de bioequivalência',
      icon: TrendingUp,
      features: ['Comparação vs Referência', 'Perfil de Dissolução', 'Bioequivalência', 'Riscos'],
      estimatedTime: '4-5 min',
      complexity: 'Avançado',
      price: 'R$ 40',
      recommended: false
    },
    {
      id: 'comprehensive-analysis',
      title: 'Análise Abrangente Multi-dimensional',
      description: 'Análise completa cobrindo aspectos regulatórios, técnicos e comerciais',
      icon: Zap,
      features: ['Análise 360°', 'Todos os Aspectos', 'Relatório Executivo', 'Plano de Ação'],
      estimatedTime: '8-12 min',
      complexity: 'Avançado',
      price: 'R$ 75',
      recommended: false
    }
  ];

  const getRecommendedAnalysis = () => {
    return analysisTypes.find(analysis => analysis.recommended);
  };

  const otherAnalyses = analysisTypes.filter(analysis => !analysis.recommended);
  const recommendedAnalysis = getRecommendedAnalysis();

  const handleAnalysisSelect = (analysisId: string) => {
    setSelectedAnalysis(analysisId);
    onAnalysisSelect(analysisId);
  };

  const AnalysisCard: React.FC<{ analysis: AnalysisType; isRecommended?: boolean }> = ({ 
    analysis, 
    isRecommended = false 
  }) => {
    const IconComponent = analysis.icon;
    const isSelected = selectedAnalysis === analysis.id;

    return (
      <Card className={`cursor-pointer transition-all duration-300 ${
        isRecommended 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'hover:shadow-md hover:border-primary/50'
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isRecommended ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <IconComponent className="h-5 w-5" />
              </div>
              {isRecommended && (
                <Badge className="bg-primary text-primary-foreground">
                  Recomendado
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {analysis.complexity}
            </Badge>
          </div>
          
          <CardTitle className="text-lg text-foreground">
            {analysis.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {analysis.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{analysis.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{analysis.price}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Incluído na Análise:
            </p>
            <div className="grid grid-cols-1 gap-1">
              {analysis.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            className={`w-full ${isRecommended ? 'bg-primary hover:bg-primary/90' : ''}`}
            variant={isRecommended ? 'default' : 'outline'}
            onClick={() => handleAnalysisSelect(analysis.id)}
          >
            {isRecommended && <Sparkles className="h-4 w-4 mr-2" />}
            Selecionar Análise
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Escolha o Tipo de Análise Especializada
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Baseado no seu documento, selecionamos as análises mais relevantes. 
          Escolha a que melhor atende às suas necessidades.
        </p>
      </div>

      {recommendedAnalysis && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Análise Recomendada para seu Documento
            </h3>
          </div>
          <AnalysisCard analysis={recommendedAnalysis} isRecommended={true} />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Outras Análises Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherAnalyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      </div>

      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Garantia de Qualidade</p>
            <p className="text-sm text-muted-foreground">
              Todas as análises são baseadas em modelos especializados e benchmarks do setor farmacêutico. 
              Resultados entregues em formato profissional com insights acionáveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializedAnalysisSelector;