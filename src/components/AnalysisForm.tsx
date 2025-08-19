
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisFormProps {
  onAnalysisStart: (file: File, instruction: string) => void;
  isLoading?: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onAnalysisStart,
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Arquivo necessário",
        description: "Por favor, selecione um arquivo PDF para análise.",
        variant: "destructive",
      });
      return;
    }

    if (!instruction.trim()) {
      toast({
        title: "Instrução necessária",
        description: "Por favor, descreva que tipo de análise você precisa.",
        variant: "destructive",
      });
      return;
    }

    onAnalysisStart(selectedFile, instruction);
  };

  const canStartAnalysis = selectedFile && instruction.trim() && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Upload de arquivo */}
      <FileUpload
        onFileChange={setSelectedFile}
        acceptedTypes=".pdf"
        maxSize={10}
      />

      {/* Campo de instrução */}
      <div className="space-y-4">
        <label className="block text-card-title">
          2. Descreva a análise que você precisa
        </label>
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Exemplo: Faça um resumo executivo do documento, identifique os pontos principais e forneça recomendações estratégicas..."
          className="min-h-[120px] resize-none text-base"
          disabled={isLoading}
        />
        <p className="text-subtle">
          Seja específico sobre que tipo de análise, resumo ou insights você precisa.
        </p>
      </div>

      {/* Botão de ação */}
      <button
        type="submit"
        disabled={!canStartAnalysis}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analisando documento...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Iniciar Análise</span>
          </>
        )}
      </button>
    </form>
  );
};
