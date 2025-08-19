
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  percentage: number;
  stage: string;
  currentStep: number;
  totalSteps: number;
}

interface AnalysisRecord {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  instruction: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File, instruction: string): Promise<string | null> => {
    if (!file || !instruction.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione um arquivo e forneça instruções.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress({ 
      percentage: 0, 
      stage: "Iniciando processo...", 
      currentStep: 1, 
      totalSteps: 6 
    });

    try {
      // Step 1: Validate file
      setUploadProgress({ 
        percentage: 10, 
        stage: "Validando arquivo...", 
        currentStep: 1, 
        totalSteps: 6 
      });

      // Step 2: Get signed upload URL
      setUploadProgress({ 
        percentage: 20, 
        stage: "Preparando upload seguro...", 
        currentStep: 2, 
        totalSteps: 6 
      });
      
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'upload',
          fileName: file.name,
          fileSize: file.size,
          instruction: instruction
        }
      });

      if (uploadError || !uploadData?.success) {
        throw new Error(uploadData?.error || 'Falha ao preparar upload');
      }

      const { uploadUrl, analysisId: newAnalysisId } = uploadData;
      setAnalysisId(newAnalysisId);

      // Step 3: Upload file to Supabase Storage
      setUploadProgress({ 
        percentage: 40, 
        stage: "Enviando arquivo para a nuvem...", 
        currentStep: 3, 
        totalSteps: 6 
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/pdf',
          'x-upsert': 'false'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Falha no upload do arquivo para o storage');
      }

      // Step 4: Trigger analysis processing
      setUploadProgress({ 
        percentage: 60, 
        stage: "Conectando com sistema de análise...", 
        currentStep: 4, 
        totalSteps: 6 
      });

      const { error: processError } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'process',
          analysisId: newAnalysisId,
          filePath: uploadData.path
        }
      });

      if (processError) {
        throw new Error('Falha ao iniciar processo de análise');
      }

      // Step 5: Analysis started
      setUploadProgress({ 
        percentage: 80, 
        stage: "Análise iniciada - processamento em andamento...", 
        currentStep: 5, 
        totalSteps: 6 
      });

      // Step 6: Complete
      setUploadProgress({ 
        percentage: 100, 
        stage: "Upload concluído! Análise em processamento...", 
        currentStep: 6, 
        totalSteps: 6 
      });

      toast({
        title: "Upload concluído!",
        description: "Seu documento foi enviado e a análise foi iniciada.",
      });

      return newAnalysisId;

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido durante o upload";
      setError(errorMessage);
      
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  const retryUpload = (file: File, instruction: string) => {
    setError(null);
    return uploadFile(file, instruction);
  };

  const checkAnalysisStatus = async (id: string): Promise<AnalysisRecord | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'status',
          analysisId: id
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Falha ao verificar status da análise');
      }

      return data.analysis;
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  };

  return {
    uploadFile,
    retryUpload,
    checkAnalysisStatus,
    uploadProgress,
    isUploading,
    analysisId,
    error
  };
};
