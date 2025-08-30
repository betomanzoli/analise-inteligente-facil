
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Copy, 
  Download,
  ExternalLink,
  TrendingUp,
  Shield,
  BookOpen
} from 'lucide-react';
import { RAGAnalysisResult as RAGResult } from '@/hooks/useRAGAnalysis';
import { useToast } from '@/hooks/use-toast';

interface RAGAnalysisResultProps {
  result: RAGResult;
  onNewAnalysis: () => void;
}

export const RAGAnalysisResult: React.FC<RAGAnalysisResultProps> = ({
  result,
  onNewAnalysis
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const { toast } = useToast();

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'Alto':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'Alto':
        return <CheckCircle className="h-4 w-4" />;
      case 'Médio':
        return <Info className="h-4 w-4" />;
      case 'Baixo':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Análise copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const downloadAnalysis = () => {
    const blob = new Blob([result.result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-rag-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse sections from the structured result
  const parseStructuredResult = (text: string) => {
    const sections = {
      executiveSummary: '',
      detailedAnalysis: '',
      inconsistencies: '',
      limitations: '',
      evidence: ''
    };

    const summaryMatch = text.match(/### Resumo Executivo\s*([\s\S]*?)(?=---|### |$)/);
    if (summaryMatch) sections.executiveSummary = summaryMatch[1].trim();

    const analysisMatch = text.match(/### Análise Detalhada\s*([\s\S]*?)(?=---|### |$)/);
    if (analysisMatch) sections.detailedAnalysis = analysisMatch[1].trim();

    const inconsistenciesMatch = text.match(/### Inconsistências e Pontos de Atenção\s*([\s\S]*?)(?=---|### |$)/);
    if (inconsistenciesMatch) sections.inconsistencies = inconsistenciesMatch[1].trim();

    const limitationsMatch = text.match(/### Limitações da Análise\s*([\s\S]*?)(?=---|### |$)/);
    if (limitationsMatch) sections.limitations = limitationsMatch[1].trim();

    const evidenceMatch = text.match(/### Evidências e Fontes Principais\s*([\s\S]*?)(?=---|### |$)/);
    if (evidenceMatch) sections.evidence = evidenceMatch[1].trim();

    return sections;
  };

  const sections = parseStructuredResult(result.result);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análise RAG Completa
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Master Agent v{result.agent_version}</span>
                <span>•</span>
                <span>{result.sources_count} fontes analisadas</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`border ${getConfidenceColor(result.confidence_level)}`}>
                <div className="flex items-center gap-1">
                  {getConfidenceIcon(result.confidence_level)}
                  Confiança: {result.confidence_level}
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => copyToClipboard(result.result)}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar Análise
        </Button>
        <Button variant="outline" onClick={downloadAnalysis}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button onClick={onNewAnalysis}>
          <Brain className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Questões
          </TabsTrigger>
          <TabsTrigger value="limitations" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Limitações
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Fontes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Executivo & Análise Detalhada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.executiveSummary && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Resumo Executivo</h4>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <pre className="whitespace-pre-wrap font-sans">{sections.executiveSummary}</pre>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {sections.detailedAnalysis && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Análise Detalhada</h4>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{sections.detailedAnalysis}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Principais Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.executiveSummary ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{sections.executiveSummary}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum insight específico extraído da análise.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Inconsistências e Pontos de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.inconsistencies ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{sections.inconsistencies}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma inconsistência significativa identificada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Limitações da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.limitations ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{sections.limitations}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma limitação específica documentada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Evidências e Fontes Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.evidence ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{sections.evidence}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Fontes e evidências não estruturadas separadamente.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
