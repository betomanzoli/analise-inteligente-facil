
import React, { useState } from 'react';
import { EnhancedFileUpload } from './EnhancedFileUpload';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface EnhancedAnalysisFormProps {
  onAnalysisStart: (analysisId: string) => void;
}

export const EnhancedAnalysisForm: React.FC<EnhancedAnalysisFormProps> = ({
  onAnalysisStart
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const { uploadFile, uploadProgress, isUploading } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !instruction.trim()) {
      return;
    }

    const analysisId = await uploadFile(selectedFile, instruction);
    if (analysisId) {
      onAnalysisStart(analysisId);
    }
  };

  const canStartAnalysis = selectedFile && instruction.trim() && !isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <EnhancedFileUpload
        onFileChange={setSelectedFile}
        acceptedTypes=".pdf"
        maxSize={25}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
      />

      <div className="space-y-4">
        <label className="block text-card-title">
          2. Descreva a análise que você precisa
        </label>
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Exemplo: Faça um resumo executivo do documento, identifique os pontos principais e forneça recomendações estratégicas..."
          className="min-h-[120px] resize-none text-base"
          disabled={isUploading}
        />
        <p className="text-subtle">
          Seja específico sobre que tipo de análise, resumo ou insights você precisa.
        </p>
      </div>

      <button
        type="submit"
        disabled={!canStartAnalysis}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processando...</span>
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
