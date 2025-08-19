
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  percentage: number;
  stage: string;
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
    setUploadProgress({ percentage: 0, stage: "Preparando upload..." });

    try {
      // Step 1: Get signed upload URL
      setUploadProgress({ percentage: 10, stage: "Obtendo URL de upload..." });
      
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

      // Step 2: Upload file to Supabase Storage
      setUploadProgress({ percentage: 30, stage: "Fazendo upload do arquivo..." });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/pdf',
          'x-upsert': 'false'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Falha no upload do arquivo');
      }

      setUploadProgress({ percentage: 70, stage: "Upload concluído, iniciando análise..." });

      // Step 3: Trigger analysis processing
      const { error: processError } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'process',
          analysisId: newAnalysisId,
          filePath: uploadData.path
        }
      });

      if (processError) {
        throw new Error('Falha ao iniciar análise');
      }

      setUploadProgress({ percentage: 100, stage: "Análise iniciada com sucesso!" });

      toast({
        title: "Upload concluído!",
        description: "Seu documento foi enviado e a análise foi iniciada.",
      });

      return newAnalysisId;

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 2000);
    }
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
        throw new Error(data?.error || 'Falha ao verificar status');
      }

      return data.analysis;
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  };

  return {
    uploadFile,
    checkAnalysisStatus,
    uploadProgress,
    isUploading,
    analysisId
  };
};
