
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Edit3, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAnalysisRecord } from '@/hooks/useAnalysisHistory';
import { FormattedResult } from './FormattedResult';
import { ResultExporter } from './ResultExporter';
import { useToast } from '@/hooks/use-toast';
import { useSemanticAnalysis } from '@/hooks/useSemanticAnalysis';
import { useStaleAnalysisCleanup } from '@/hooks/useStaleAnalysisCleanup';

interface EnhancedAnalysisResultProps {
  analysisId: string;
  onRetry?: (analysisId: string) => void;
  onEdit?: (analysisId: string) => void;
}

export const EnhancedAnalysisResult: React.FC<EnhancedAnalysisResultProps> = ({
  analysisId,
  onRetry,
  onEdit
}) => {
  const { data: analysis, isLoading, error: queryError } = useAnalysisRecord(analysisId);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const { toast } = useToast();
  const { performAnalysis, isAnalyzing } = useSemanticAnalysis();
  
  // Inicializar limpeza automática de análises órfãs
  useStaleAnalysisCleanup();

  // Check for timeout
  useEffect(() => {
    if (analysis?.status === 'pending' || analysis?.status === 'processing') {
      const timeout = setTimeout(() => {
        setTimeoutWarning(true);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timeout);
    }
  }, [analysis?.status]);

  // Auto-check for stale processes
  useEffect(() => {
    if (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
      const createdAt = new Date(analysis.created_at).getTime();
      const now = Date.now();
      const minutesElapsed = (now - createdAt) / (1000 * 60);
      
      if (minutesElapsed > 10) {
        setTimeoutWarning(true);
      }
    }
  }, [analysis]);

  if (isLoading) {
    return (
      <div className="result-card animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <div>
            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (queryError || !analysis) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar resultado da análise. Tente recarregar a página.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusConfig = () => {
    switch (analysis.status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          text: 'Aguardando processamento',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200'
        };
      case 'processing':
        return {
          icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>,
          text: 'Processando análise',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'Análise concluída',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: 'Erro no processamento',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" />,
          text: 'Status desconhecido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleRetry = async () => {
    if (onRetry) {
      onRetry(analysisId);
      setTimeoutWarning(false);
    } else if (analysis.instruction && isSemanticAnalysis(analysis)) {
      // Para análises semânticas, tentar novamente usando o hook
      const newAnalysisId = await performAnalysis(analysis.instruction);
      if (newAnalysisId) {
        toast({
          title: "Nova análise iniciada",
          description: "Uma nova análise foi iniciada com sucesso.",
        });
        // Aqui você poderia redirecionar para a nova análise se necessário
      }
      setTimeoutWarning(false);
    } else {
      toast({
        title: "Função não disponível",
        description: "A função de retry não está disponível para este tipo de análise.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(analysisId);
    } else {
      toast({
        title: "Função não disponível",
        description: "A função de edição não está disponível neste contexto.",
        variant: "destructive",
      });
    }
  };

  // Função para determinar se é uma análise semântica
  const isSemanticAnalysis = (analysis: any) => {
    return analysis.file_name?.startsWith('Análise IA:') || 
           analysis.instruction?.length > 50 || // Instruções longas geralmente são consultas semânticas
           !analysis.file_name?.includes('.');  // Análises semânticas não têm extensão de arquivo
  };

  return (
    <div className="space-y-4">
      <div className={`result-card animate-slide-up border ${statusConfig.bgColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {statusConfig.icon}
            <div>
              <h3 className={`font-medium ${statusConfig.color}`}>
                {statusConfig.text}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-subtle mt-1">
                <FileText className="h-4 w-4" />
                <span>{isSemanticAnalysis(analysis) ? 'Análise IA' : analysis.file_name}</span>
              </div>
              {analysis.instruction && (
                <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                  {isSemanticAnalysis(analysis) ? `Consulta: ${analysis.instruction}` : `Instrução: ${analysis.instruction}`}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Criado em {new Date(analysis.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {(analysis.status === 'error' || timeoutWarning) && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
            </div>
          )}
        </div>

        {/* Timeout Warning */}
        {timeoutWarning && analysis.status !== 'error' && analysis.status !== 'completed' && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              O processamento está demorando mais que o esperado. Isso pode indicar um problema no servidor.
              <Button
                variant="link"
                size="sm"
                onClick={handleRetry}
                disabled={isAnalyzing}
                className="ml-2 p-0 h-auto text-amber-700 underline"
              >
                {isAnalyzing ? 'Tentando...' : 'Tentar novamente'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {analysis.status === 'error' && analysis.error_message && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro:</strong> {analysis.error_message}
              <div className="mt-2 text-sm">
                {isSemanticAnalysis(analysis) 
                  ? 'Verifique se há documentos na sua base de conhecimento e tente novamente.'
                  : 'Por favor, verifique se o arquivo está íntegro e tente novamente.'
                }
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Processing Progress */}
        {(analysis.status === 'pending' || analysis.status === 'processing') && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{isSemanticAnalysis(analysis) ? 'Progresso da análise IA' : 'Progresso da análise'}</span>
              <span>{analysis.status === 'processing' ? 'Em andamento...' : 'Na fila'}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  analysis.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-amber-400'
                }`}
                style={{ 
                  width: analysis.status === 'processing' ? '60%' : '30%' 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Analysis Result */}
      {analysis.status === 'completed' && analysis.result && (
        <div className="space-y-4">
          <FormattedResult content={analysis.result} />
          <ResultExporter 
            content={analysis.result}
            fileName={isSemanticAnalysis(analysis) ? 'Análise IA' : analysis.file_name}
          />
        </div>
      )}
    </div>
  );
};
