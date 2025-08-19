
import React, { useEffect, useState } from 'react';
import { FileText, Download, Copy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

interface AnalysisRecord {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  error_message?: string;
  created_at: string;
}

interface EnhancedAnalysisResultProps {
  analysisId: string | null;
  fileName?: string;
}

export const EnhancedAnalysisResult: React.FC<EnhancedAnalysisResultProps> = ({
  analysisId,
  fileName
}) => {
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { checkAnalysisStatus } = useFileUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (!analysisId) return;

    const pollStatus = async () => {
      const result = await checkAnalysisStatus(analysisId);
      if (result) {
        setAnalysis(result);
        
        if (result.status === 'completed' || result.status === 'error') {
          setIsPolling(false);
          if (result.status === 'completed') {
            toast({
              title: "Análise concluída!",
              description: "Seu documento foi analisado com sucesso.",
            });
          }
        }
      }
    };

    // Initial check
    pollStatus();
    setIsPolling(true);

    // Poll every 3 seconds until completion
    const interval = setInterval(pollStatus, 3000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [analysisId, checkAnalysisStatus, toast]);

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

  const handleDownload = () => {
    if (analysis?.result) {
      const blob = new Blob([analysis.result], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise_${analysis.file_name?.replace('.pdf', '') || 'documento'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: "O relatório está sendo baixado.",
      });
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
        return 'Analisando documento...';
      case 'completed':
        return 'Análise concluída';
      case 'error':
        return 'Erro na análise';
      default:
        return 'Status desconhecido';
    }
  };

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
            <button
              onClick={handleDownload}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Baixar relatório"
            >
              <Download className="h-4 w-4" />
            </button>
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
              </div>
            </div>

            {/* Content */}
            {analysis.status === 'completed' && analysis.result && (
              <div className="prose prose-gray max-w-none animate-fade-in">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {analysis.result}
                </pre>
              </div>
            )}

            {analysis.status === 'error' && analysis.error_message && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Erro na Análise</h3>
                <p className="text-muted-foreground mb-4">
                  {analysis.error_message}
                </p>
                <p className="text-sm text-subtle">
                  Tente novamente ou entre em contato com o suporte se o problema persistir.
                </p>
              </div>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Este processo pode levar alguns minutos dependendo do tamanho do documento.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Carregando informações da análise...</p>
          </div>
        )}
      </div>
    </div>
  );
};
