
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Zap, Eye, Database } from 'lucide-react';
import { AnalysisRecord } from '@/hooks/useAnalysisHistory';

interface NativeProcessingStatusProps {
  analysis: AnalysisRecord;
}

export const NativeProcessingStatus: React.FC<NativeProcessingStatusProps> = ({
  analysis
}) => {
  const getStatusIcon = () => {
    switch (analysis.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'text_extracted':
        return <Eye className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (analysis.status) {
      case 'completed':
        return 'Processamento Concluído';
      case 'processing':
        return 'Processando com OCR Avançado';
      case 'text_extracted':
        return 'Texto Extraído - Gerando Embeddings';
      case 'error':
        return 'Erro no Processamento';
      default:
        return 'Aguardando Processamento';
    }
  };

  const getStatusDescription = () => {
    switch (analysis.status) {
      case 'completed':
        return 'Documento processado e indexado na base de conhecimento';
      case 'processing':
        return 'Extraindo texto com Google Cloud Vision API...';
      case 'text_extracted':
        return 'Dividindo em chunks e gerando embeddings...';
      case 'error':
        return analysis.error_message || 'Erro desconhecido no processamento';
      default:
        return 'Documento na fila de processamento';
    }
  };

  const isNativeProcessing = analysis.file_path !== 'semantic-analysis' && 
                            analysis.instruction !== analysis.file_name;

  if (!isNativeProcessing) return null;

  return (
    <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-l-primary">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Processamento Nativo</span>
          </div>
          
          <h4 className="font-medium text-card-title">
            {getStatusText()}
          </h4>
          
          <p className="text-sm text-subtle">
            {getStatusDescription()}
          </p>
          
          {analysis.status === 'completed' && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <Database className="h-3 w-3" />
              <span>Documento indexado e disponível para consultas IA</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Arquivo: {analysis.file_name} • {Math.round(analysis.file_size / 1024)} KB
          </div>
        </div>
      </div>
    </div>
  );
};
