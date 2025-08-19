
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface UploadProgress {
  percentage: number;
  stage: string;
  currentStep: number;
  totalSteps: number;
}

interface DetailedProgressIndicatorProps {
  progress: UploadProgress;
  error?: string | null;
}

export const DetailedProgressIndicator: React.FC<DetailedProgressIndicatorProps> = ({
  progress,
  error
}) => {
  const steps = [
    "Validando arquivo",
    "Preparando upload",
    "Enviando arquivo",
    "Iniciando análise",
    "Processando",
    "Concluindo"
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Status do Upload</h3>
        <span className="text-sm text-muted-foreground">
          Etapa {progress.currentStep} de {progress.totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Current Status */}
      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
        <div className="relative">
          {error ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {error ? "Erro no processo" : progress.stage}
          </p>
          <p className="text-sm text-muted-foreground">
            {error || `${progress.percentage}% concluído`}
          </p>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < progress.currentStep;
          const isCurrent = stepNumber === progress.currentStep;
          const isError = error && isCurrent;

          return (
            <div 
              key={stepNumber}
              className={`flex items-center space-x-3 p-2 rounded ${
                isCurrent ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {isError ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                ) : (
                  <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                )}
              </div>
              <span className={`text-sm ${
                isCompleted ? 'text-green-600' : 
                isCurrent ? 'text-primary font-medium' : 
                'text-muted-foreground'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
