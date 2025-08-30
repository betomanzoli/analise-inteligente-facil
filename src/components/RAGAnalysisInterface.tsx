
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Search, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRAGAnalysis, RAGAnalysisResult } from '@/hooks/useRAGAnalysis';
import { useToast } from '@/hooks/use-toast';

interface RAGAnalysisInterfaceProps {
  onAnalysisComplete: (result: RAGAnalysisResult) => void;
}

export const RAGAnalysisInterface: React.FC<RAGAnalysisInterfaceProps> = ({
  onAnalysisComplete
}) => {
  const [query, setQuery] = useState('');
  const { performRAGAnalysis, isAnalyzing, error, steps } = useRAGAnalysis();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Consulta necessária",
        description: "Por favor, descreva sua consulta para análise RAG.",
        variant: "destructive",
      });
      return;
    }

    const result = await performRAGAnalysis(query);
    
    if (result) {
      onAnalysisComplete(result);
      setQuery('');
      toast({
        title: "Análise RAG concluída",
        description: `Análise realizada com confiança ${result.confidence_level} usando ${result.sources_count} fontes.`,
      });
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const canStartAnalysis = query.trim() && !isAnalyzing;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Sistema RAG - Master Agent v7.0
          </CardTitle>
          <p className="text-subtle">
            Sistema de Análise Inteligente com Recuperação Aumentada de Informações. 
            Faça perguntas complexas e obtenha análises estruturadas baseadas em seus documentos.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-title">
                Sua Consulta Analítica
              </label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Exemplo: Analise os riscos regulatórios mencionados nos documentos e identifique as principais oportunidades de mitigação. Compare diferentes abordagens apresentadas e forneça recomendações estratégicas baseadas nas evidências encontradas."
                className="min-h-[120px] resize-none text-base"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-subtle">
                Seja específico sobre que tipo de análise você precisa. O sistema irá buscar informações relevantes 
                e fornecer uma análise estruturada com citações das fontes.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!canStartAnalysis}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Iniciar Análise RAG
                </>
              )}
            </Button>
          </form>

          {/* Progress Indicator */}
          {isAnalyzing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-subtle">Progresso da Análise</span>
                  <span className="text-subtle">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.name}</div>
                      {step.message && (
                        <div className="text-xs text-subtle">{step.message}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive mb-1">Erro na Análise RAG</h4>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Capacidades do Sistema RAG</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-subtle">
              <div className="space-y-1">
                <div>• Análise contextual avançada</div>
                <div>• Detecção de inconsistências</div>
                <div>• Avaliação de confiança</div>
              </div>
              <div className="space-y-1">
                <div>• Citações precisas das fontes</div>
                <div>• Análise de vieses e limitações</div>
                <div>• Insights estratégicos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
