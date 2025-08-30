
import React, { useState, useEffect } from 'react';
import { AnalysisRecord } from '@/hooks/useAnalysisHistory';
import { FormattedResult } from './FormattedResult';
import { NativeProcessingStatus } from './NativeProcessingStatus';
import { DetailedProgressIndicator } from './DetailedProgressIndicator';
import { ResultExporter } from './ResultExporter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Zap,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedAnalysisResultProps {
  analysis: AnalysisRecord;
  onRefresh: () => void;
}

export const EnhancedAnalysisResult: React.FC<EnhancedAnalysisResultProps> = ({
  analysis,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Auto-refresh for processing analyses
  useEffect(() => {
    if (analysis.status === 'processing' || analysis.status === 'text_extracted') {
      setAutoRefreshEnabled(true);
      const interval = setInterval(() => {
        onRefresh();
      }, 3000); // Refresh every 3 seconds

      return () => {
        clearInterval(interval);
        setAutoRefreshEnabled(false);
      };
    }
  }, [analysis.status, onRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Visual feedback
    onRefresh();
    setIsRefreshing(false);
  };

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
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (analysis.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'text_extracted':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isNativeProcessing = analysis.file_path !== 'semantic-analysis';
  const isAIAnalysis = analysis.file_path === 'semantic-analysis';

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isNativeProcessing ? (
                  <Zap className="h-5 w-5 text-primary" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                <CardTitle className="text-lg">
                  {analysis.file_name}
                </CardTitle>
              </div>
              <Badge className={getStatusColor()}>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  {analysis.status}
                </div>
              </Badge>
            </div>
            
            {isAIAnalysis && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                <strong>Consulta:</strong> {analysis.instruction}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(analysis.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {!isAIAnalysis && (
                <span>{Math.round(analysis.file_size / 1024)} KB</span>
              )}
              {analysis.project_name && (
                <Badge variant="outline" className="text-xs">
                  {analysis.project_name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {autoRefreshEnabled ? 'Auto' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {isNativeProcessing && (
          <NativeProcessingStatus analysis={analysis} />
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {(analysis.status === 'processing' || analysis.status === 'text_extracted') && (
          <DetailedProgressIndicator 
            status={analysis.status} 
            isNativeProcessing={isNativeProcessing}
          />
        )}

        {analysis.status === 'error' && analysis.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Erro no Processamento</h4>
                <p className="text-sm text-red-700">{analysis.error_message}</p>
              </div>
            </div>
          </div>
        )}

        {analysis.result && analysis.status === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isAIAnalysis ? 'Resultado da Análise IA' : 'Processamento Concluído'}
              </h3>
              <ResultExporter analysis={analysis} />
            </div>
            <FormattedResult content={analysis.result} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
