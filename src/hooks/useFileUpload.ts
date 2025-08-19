
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UploadProgress {
  percentage: number;
  stage: string;
  currentStep: number;
  totalSteps: number;
}

interface AnalysisRecord {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  error_message?: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, instruction: string = ''): Promise<string | null> => {
    console.log('Starting file upload process...');
    
    setIsUploading(true);
    setError(null);
    setUploadProgress({
      percentage: 0,
      stage: 'Preparando upload...',
      currentStep: 1,
      totalSteps: 6
    });

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('User session:', session?.user?.id ? 'Authenticated' : 'Anonymous');

      // Step 1: Upload to Supabase Storage
      setUploadProgress({
        percentage: 15,
        stage: 'Fazendo upload do arquivo...',
        currentStep: 2,
        totalSteps: 6
      });

      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('File uploaded to storage:', uploadData.path);

      // Step 2: Create analysis record
      setUploadProgress({
        percentage: 30,
        stage: 'Criando registro de análise...',
        currentStep: 3,
        totalSteps: 6
      });

      const analysisData = {
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        instruction: instruction || 'Análise padrão do documento',
        status: 'pending' as const,
        user_id: session?.user?.id || null, // Support both authenticated and anonymous users
      };

      const { data: recordData, error: recordError } = await supabase
        .from('analysis_records')
        .insert(analysisData)
        .select()
        .single();

      if (recordError) {
        throw new Error(`Erro ao criar registro: ${recordError.message}`);
      }

      console.log('Analysis record created:', recordData.id);

      // Step 3: Trigger webhook
      setUploadProgress({
        percentage: 50,
        stage: 'Enviando para processamento...',
        currentStep: 4,
        totalSteps: 6
      });

      const webhookResponse = await fetch('https://hook.us2.make.com/5qwckbipv8xz9v2pcfxlhyk81tkclyh2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_id: recordData.id,
          file_path: uploadData.path,
          file_name: file.name,
          instruction: instruction,
          user_id: session?.user?.id || null,
        }),
      });

      setUploadProgress({
        percentage: 75,
        stage: 'Webhook enviado, aguardando confirmação...',
        currentStep: 5,
        totalSteps: 6
      });

      if (!webhookResponse.ok) {
        throw new Error(`Erro no webhook: ${webhookResponse.status}`);
      }

      console.log('Webhook sent successfully');

      // Step 4: Complete
      setUploadProgress({
        percentage: 100,
        stage: 'Upload concluído! Iniciando análise...',
        currentStep: 6,
        totalSteps: 6
      });

      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);

      return recordData.id;

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      setError(errorMessage);
      setUploadProgress(null);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const retryUpload = useCallback(async (file: File, instruction: string = ''): Promise<string | null> => {
    console.log('Retrying file upload...');
    return uploadFile(file, instruction);
  }, [uploadFile]);

  const checkAnalysisStatus = useCallback(async (analysisId: string): Promise<AnalysisRecord | null> => {
    try {
      const { data, error } = await supabase
        .from('analysis_records')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('Error fetching analysis record:', error);
        return null;
      }

      // Type assertion to ensure status matches our union type
      return data ? {
        ...data,
        status: data.status as 'pending' | 'processing' | 'completed' | 'error'
      } : null;
    } catch (error) {
      console.error('Failed to fetch analysis record:', error);
      return null;
    }
  }, []);

  return {
    uploadFile,
    retryUpload,
    checkAnalysisStatus,
    isUploading,
    uploadProgress,
    error,
  };
};
