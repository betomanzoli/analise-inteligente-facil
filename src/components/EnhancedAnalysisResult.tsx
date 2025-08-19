
import React, { useEffect, useState } from 'react';
import { FileText, Download, Copy, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAnalysisRecord } from '@/hooks/useAnalysisHistory';
import { DetailedProgressIndicator } from './DetailedProgressIndicator';
import { ErrorHandler } from './ErrorHandler';
import { FormattedResult } from './FormattedResult';
import { SectionNavigation } from './SectionNavigation';
import { ResultExporter } from './ResultExporter';
import { InteractiveVisualization } from './InteractiveVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnhancedAnalysisResultProps {
  analysisId: string | null;
  fileName?: string;
  uploadProgress?: {
    percentage: number;
    stage: string;
    currentStep: number;
    totalSteps: number;
  } | null;
  uploadError?: string | null;
  onRetryUpload?: () => void;
  isRetrying?: boolean;
}

export const EnhancedAnalysisResult: React.FC<EnhancedAnalysisResultProps> = ({
  analysisId,
  fileName,
  uploadProgress,
  uploadError,
  onRetryUpload,
  isRetrying
}) => {
  const { data: analysis, isLoading } = useAnalysisRecord(analysisId);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (analysis?.result) {
      try {
        await navigator.clipboard.writeText(analysis.result);
        toast({
          title: "Copiado!",
          description: "O relatório foi copiado para a área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando processamento...';
      case 'processing':
        return 'Analisando documento com IA...';
      case 'completed':
        return 'Análise concluída';
      case 'error':
        return 'Erro na análise';
      default:
        return 'Status desconhecido';
    }
  };

  // Show upload progress if uploading
  if (uploadProgress) {
    return (
      <div className="space-y-4">
        <h2 className="text-section-title flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span>Upload em Progresso</span>
        </h2>
        
        <div className="result-card">
          <DetailedProgressIndicator 
            progress={uploadProgress}
            error={uploadError}
          />
        </div>
        
        {uploadError && onRetryUpload && (
          <ErrorHandler
            error={uploadError}
            onRetry={onRetryUpload}
            isRetrying={isRetrying}
          />
        )}
      </div>
    );
  }

  if (!analysisId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-section-title flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span>Relatório de Análise</span>
        </h2>
        
        {analysis?.result && (
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Copiar relatório"
            >
              <Copy className="h-4 w-4" />
            </button>
            <ResultExporter 
              content={analysis.result} 
              fileName={analysis.file_name?.replace('.pdf', '') || 'documento'} 
            />
          </div>
        )}
      </div>

      <div className="result-card min-h-[300px]">
        {analysis ? (
          <>
            {/* Status Header */}
            <div className="flex items-center space-x-3 mb-6 p-4 bg-muted/50 rounded-lg">
              {getStatusIcon(analysis.status)}
              <div>
                <p className="font-medium">{getStatusText(analysis.status)}</p>
                <p className="text-sm text-subtle">
                  Arquivo: {analysis.file_name}
                </p>
                {(analysis.status === 'processing' || analysis.status === 'pending') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Este processo pode levar alguns minutos dependendo do tamanho do documento
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            {analysis.status === 'completed' && analysis.result && (
              <div className="animate-fade-in">
                <Tabs defaultValue="formatted" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="formatted">Relatório</TabsTrigger>
                    <TabsTrigger value="visualization">Visualizações</TabsTrigger>
                    <TabsTrigger value="navigation">Navegação</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="formatted" className="mt-4">
                    <FormattedResult content={analysis.result} />
                  </TabsContent>
                  
                  <TabsContent value="visualization" className="mt-4">
                    <InteractiveVisualization content={analysis.result} />
                  </TabsContent>
                  
                  <TabsContent value="navigation" className="mt-4">
                    <div className="flex">
                      <div className="flex-1 pr-4">
                        <FormattedResult content={analysis.result} />
                      </div>
                      <SectionNavigation content={analysis.result} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {analysis.status === 'error' && analysis.error_message && (
              <ErrorHandler error={analysis.error_message} />
            )}

            {(analysis.status === 'pending' || analysis.status === 'processing') && (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">{getStatusText(analysis.status)}</p>
                  <p className="text-subtle">
                    Nossa IA está processando seu arquivo e gerando insights personalizados.
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>• Extração de texto e estrutura</p>
                    <p>• Análise de conteúdo com IA</p>
                    <p>• Geração de relatório detalhado</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p>Carregando informações da análise...</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
