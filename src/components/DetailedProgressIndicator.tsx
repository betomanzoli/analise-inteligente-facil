
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

interface DetailedProgressIndicatorProps {
  status: 'processing' | 'text_extracted';
  isNativeProcessing: boolean;
}

export const DetailedProgressIndicator: React.FC<DetailedProgressIndicatorProps> = ({
  status,
  isNativeProcessing
}) => {
  const getProgressSteps = () => {
    if (isNativeProcessing) {
      return [
        { label: "Upload do arquivo", completed: true },
        { label: "Extração de texto (OCR)", completed: status !== 'processing', current: status === 'processing' },
        { label: "Divisão em chunks", completed: status === 'completed', current: status === 'text_extracted' },
        { label: "Geração de embeddings", completed: false, current: false },
        { label: "Indexação na base", completed: false, current: false }
      ];
    } else {
      return [
        { label: "Preparando análise", completed: true },
        { label: "Processando com IA", completed: false, current: true },
        { label: "Gerando relatório", completed: false, current: false }
      ];
    }
  };

  const steps = getProgressSteps();
  const currentStepIndex = steps.findIndex(step => step.current);
  const progress = ((steps.filter(step => step.completed).length) / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {isNativeProcessing ? 'Processamento Nativo' : 'Análise IA'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}% concluído
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          return (
            <div 
              key={index}
              className={`flex items-center space-x-3 p-2 rounded ${
                step.current ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : step.current ? (
                  status === 'text_extracted' ? (
                    <Eye className="h-4 w-4 text-yellow-500 animate-pulse" />
                  ) : (
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                  )
                ) : (
                  <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                )}
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-green-600' : 
                step.current ? 'text-primary font-medium' : 
                'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
