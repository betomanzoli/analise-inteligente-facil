
import React from 'react';
import { AlertTriangle, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorHandlerProps {
  error: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  isRetrying = false
}) => {
  const getErrorDetails = (errorMessage: string) => {
    const lowercaseError = errorMessage.toLowerCase();
    
    if (lowercaseError.includes('arquivo muito grande') || lowercaseError.includes('file too large')) {
      return {
        title: "Arquivo muito grande",
        description: "O arquivo selecionado excede o limite de 25MB. Tente um arquivo menor.",
        suggestion: "Comprima o PDF ou divida-o em partes menores.",
        canRetry: false
      };
    }
    
    if (lowercaseError.includes('formato') || lowercaseError.includes('format')) {
      return {
        title: "Formato não suportado",
        description: "Apenas arquivos PDF são aceitos no momento.",
        suggestion: "Converta seu arquivo para PDF e tente novamente.",
        canRetry: false
      };
    }
    
    if (lowercaseError.includes('upload') || lowercaseError.includes('storage')) {
      return {
        title: "Falha no upload",
        description: "Houve um problema ao enviar seu arquivo.",
        suggestion: "Verifique sua conexão de internet e tente novamente.",
        canRetry: true
      };
    }
    
    if (lowercaseError.includes('webhook') || lowercaseError.includes('análise')) {
      return {
        title: "Falha na análise",
        description: "O sistema de análise está temporariamente indisponível.",
        suggestion: "Tente novamente em alguns minutos.",
        canRetry: true
      };
    }
    
    return {
      title: "Erro inesperado",
      description: errorMessage,
      suggestion: "Se o problema persistir, entre em contato com o suporte.",
      canRetry: true
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-destructive mb-1">
              {errorDetails.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {errorDetails.description}
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded p-3">
            <div className="flex items-start space-x-2">
              <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Como resolver:
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorDetails.suggestion}
                </p>
              </div>
            </div>
          </div>

          {errorDetails.canRetry && onRetry && (
            <div className="flex items-center space-x-3">
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RotateCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
