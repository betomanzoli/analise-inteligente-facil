
import React, { useState } from 'react';
import { EnhancedFileUpload } from './EnhancedFileUpload';
import { BatchUploadForm } from './BatchUploadForm';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnhancedAnalysisFormProps {
  onAnalysisStart: (analysisId: string | string[]) => void;
}

export const EnhancedAnalysisForm: React.FC<EnhancedAnalysisFormProps> = ({
  onAnalysisStart
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const { uploadFile, uploadProgress, isUploading } = useFileUpload();

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !instruction.trim()) {
      return;
    }

    const analysisId = await uploadFile(selectedFile, instruction);
    if (analysisId) {
      onAnalysisStart(analysisId);
    }
  };

  const handleBatchStart = (analysisIds: string[]) => {
    onAnalysisStart(analysisIds);
  };

  const canStartSingleAnalysis = selectedFile && instruction.trim() && !isUploading;

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single">Arquivo Único</TabsTrigger>
        <TabsTrigger value="batch">Upload em Lote</TabsTrigger>
      </TabsList>
      
      <TabsContent value="single" className="mt-6">
        <form onSubmit={handleSingleSubmit} className="space-y-8">
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
            disabled={!canStartSingleAnalysis}
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
      </TabsContent>
      
      <TabsContent value="batch" className="mt-6">
        <BatchUploadForm onBatchStart={handleBatchStart} />
      </TabsContent>
    </Tabs>
  );
};
