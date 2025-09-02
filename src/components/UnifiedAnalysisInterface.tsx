
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NativeIngestionForm } from './NativeIngestionForm';
import { RAGAnalysisInterface } from './RAGAnalysisInterface';
import { RAGAnalysisResult } from './RAGAnalysisResult';
import { Upload, Brain, Database, Search } from 'lucide-react';
import { RAGAnalysisResult as RAGResult } from '@/hooks/useRAGAnalysis';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';

interface UnifiedAnalysisInterfaceProps {
  onAnalysisStart: (analysisId: string | string[]) => void;
}

export const UnifiedAnalysisInterface: React.FC<UnifiedAnalysisInterfaceProps> = ({
  onAnalysisStart
}) => {
  const [ragResult, setRagResult] = useState<RAGResult | null>(null);
  const { analyses } = useAnalysisHistory();

  // Contar documentos processados com sucesso
  const processedDocumentsCount = analyses.filter(
    analysis => analysis.status === 'completed'
  ).length;

  const handleRAGAnalysisComplete = (result: RAGResult) => {
    setRagResult(result);
    onAnalysisStart(result.analysis_id);
  };

  const handleNewRAGAnalysis = () => {
    setRagResult(null);
  };

  if (ragResult) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <RAGAnalysisResult 
          result={ragResult} 
          onNewAnalysis={handleNewRAGAnalysis}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-card-title mb-4">
          Sistema de Análise Documental IA
        </h2>
        <p className="text-lg text-subtle max-w-2xl mx-auto mb-4">
          Processe documentos complexos e realize análises inteligentes com IA avançada.
        </p>
        
        {processedDocumentsCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Database className="h-4 w-4" />
            {processedDocumentsCount} documento{processedDocumentsCount !== 1 ? 's' : ''} na base de dados
          </div>
        )}
      </div>

      <Tabs defaultValue="ingestion" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingestion" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            📥 Adicionar Documentos
          </TabsTrigger>
          <TabsTrigger value="rag" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            🔍 Consultar e Analisar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ingestion" className="mt-8">
          <div className="bg-card/50 rounded-lg border p-6">
            <div className="mb-6 text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-title mb-2">
                Ingestão de Documentos
              </h3>
              <p className="text-subtle">
                Adicione novos documentos PDF ao seu banco de dados inteligente. 
                O sistema usa OCR avançado com Google Cloud Vision API para extrair 
                texto com máxima precisão e criar embeddings vetoriais para análise.
              </p>
            </div>
            <NativeIngestionForm onIngestionStart={onAnalysisStart} />
          </div>
        </TabsContent>
        
        <TabsContent value="rag" className="mt-8">
          <div className="bg-card/50 rounded-lg border p-6">
            <div className="mb-6 text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-title mb-2">
                Análise RAG Inteligente
              </h3>
              <p className="text-subtle">
                Faça perguntas complexas e obtenha análises estruturadas baseadas 
                nos documentos já processados. O Master Agent v7.0 utiliza busca 
                semântica avançada para encontrar informações relevantes e gerar insights.
              </p>
              {processedDocumentsCount === 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Você precisa adicionar documentos primeiro para usar a análise RAG.
                    <br />
                    Use a aba "📥 Adicionar Documentos" para começar.
                  </p>
                </div>
              )}
            </div>
            {processedDocumentsCount > 0 ? (
              <RAGAnalysisInterface onAnalysisComplete={handleRAGAnalysisComplete} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Adicione documentos para começar a usar a análise RAG.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
