
import React from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AnalysisRecord } from '@/hooks/useAnalysisHistory';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalysisHistorySidebarProps {
  analyses: AnalysisRecord[];
  selectedAnalysisIds: string[];
  onAnalysisSelect: (analysisIds: string[]) => void;
  onRefresh: () => void;
}

export const AnalysisHistorySidebar: React.FC<AnalysisHistorySidebarProps> = ({
  analyses,
  selectedAnalysisIds,
  onAnalysisSelect,
  onRefresh
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'text_extracted':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'secondary',
      text_extracted: 'secondary',
      completed: 'default',
      error: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendente',
      processing: 'Processando',
      text_extracted: 'Extraindo',
      completed: 'Concluído',
      error: 'Erro'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleAnalysisClick = (analysisId: string) => {
    if (selectedAnalysisIds.includes(analysisId)) {
      onAnalysisSelect(selectedAnalysisIds.filter(id => id !== analysisId));
    } else {
      onAnalysisSelect([...selectedAnalysisIds, analysisId]);
    }
  };

  return (
    <div className="w-80 border-r bg-background shadow-lg">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Histórico de Análises</h3>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <FileText className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {analyses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma análise encontrada</p>
              <p className="text-sm">Faça sua primeira análise!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => handleAnalysisClick(analysis.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                    selectedAnalysisIds.includes(analysis.id) ? 'bg-muted border-primary' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(analysis.status)}
                      <span className="font-medium text-sm truncate">
                        {analysis.file_name}
                      </span>
                    </div>
                    {getStatusBadge(analysis.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                    {analysis.instruction || 'Análise padrão'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(analysis.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                    <span>
                      {(analysis.file_size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
