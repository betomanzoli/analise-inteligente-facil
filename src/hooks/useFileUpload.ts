import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFileHash } from './useFileHash';

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

interface DuplicateInfo {
  id: string;
  file_name: string;
  created_at: string;
  project_name?: string;
}

interface UploadOptions {
  projectId?: string;
  projectName?: string;
  tags?: string[];
  allowDuplicate?: boolean;
  isIngestion?: boolean;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const { calculateHash } = useFileHash();

  const checkForDuplicate = useCallback(async (fileHash: string): Promise<DuplicateInfo | null> => {
    const { data, error } = await supabase
      .from('analysis_records')
      .select('id, file_name, created_at, project_name')
      .eq('file_hash', fileHash)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking for duplicates:', error);
      return null;
    }

    return data;
  }, []);

  const uploadFile = useCallback(async (
    file: File, 
    instruction: string = '', 
    options: UploadOptions = {}
  ): Promise<string | null> => {
    console.log('Starting file upload process...');
    
    setIsUploading(true);
    setError(null);
    setDuplicateInfo(null);
    setUploadProgress({
      percentage: 0,
      stage: 'Calculando hash do arquivo...',
      currentStep: 1,
      totalSteps: 7
    });

    try {
      // Calculate file hash
      const fileHash = await calculateHash(file);
      
      setUploadProgress({
        percentage: 15,
        stage: 'Verificando duplicatas...',
        currentStep: 2,
        totalSteps: 7
      });

      // Check for duplicates unless explicitly allowed
      if (!options.allowDuplicate) {
        const duplicate = await checkForDuplicate(fileHash);
        if (duplicate) {
          setDuplicateInfo(duplicate);
          setIsUploading(false);
          setUploadProgress(null);
          return null; // Return null to indicate duplicate found
        }
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('User session:', session?.user?.id ? 'Authenticated' : 'Anonymous');

      // Step 1: Upload to Supabase Storage
      setUploadProgress({
        percentage: 30,
        stage: 'Fazendo upload do arquivo...',
        currentStep: 3,
        totalSteps: 7
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
        percentage: 45,
        stage: 'Criando registro de análise...',
        currentStep: 4,
        totalSteps: 7
      });

      const analysisData = {
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_hash: fileHash,
        instruction: instruction || 'Análise padrão do documento',
        project_name: options.projectName,
        status: 'pending' as const,
        user_id: session?.user?.id || null,
        processing_timeout: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes timeout
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

      // Step 3: Link to project if specified
      if (options.projectId) {
        setUploadProgress({
          percentage: 55,
          stage: 'Vinculando ao projeto...',
          currentStep: 5,
          totalSteps: 7
        });

        await supabase
          .from('document_projects')
          .insert({
            analysis_record_id: recordData.id,
            project_id: options.projectId,
          });
      }

      // Step 4: Link to tags
      if (options.tags && options.tags.length > 0) {
        setUploadProgress({
          percentage: 65,
          stage: 'Processando tags...',
          currentStep: 5,
          totalSteps: 7
        });

        for (const tagName of options.tags) {
          // First try to find existing tag
          let { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .eq('user_id', session?.user?.id || '')
            .single();

          let tagId = existingTag?.id;

          // Create tag if it doesn't exist
          if (!tagId && session?.user?.id) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: session.user.id })
              .select('id')
              .single();

            if (!tagError) {
              tagId = newTag.id;
            }
          }

          // Link document to tag
          if (tagId) {
            await supabase
              .from('document_tags')
              .insert({
                analysis_record_id: recordData.id,
                tag_id: tagId,
              });
          }
        }
      }

      // Step 5: Call Edge Function instead of direct webhook
      setUploadProgress({
        percentage: 80,
        stage: 'Enviando para processamento...',
        currentStep: 6,
        totalSteps: 7
      });

      const { error: functionError } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'process',
          analysis_id: recordData.id,
          file_path: uploadData.path,
          file_name: file.name,
          instruction: instruction,
          user_id: session?.user?.id || null,
          project_name: options.projectName,
          isBatchUpload: false,
        },
      });

      if (functionError) {
        throw new Error(`Erro no processamento: ${functionError.message}`);
      }

      console.log('Processing started successfully');

      // Step 6: Complete
      setUploadProgress({
        percentage: 100,
        stage: 'Upload concluído! Iniciando análise...',
        currentStep: 7,
        totalSteps: 7
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
  }, [calculateHash, checkForDuplicate]);

  const retryUpload = useCallback(async (
    file: File, 
    instruction: string = '', 
    options: UploadOptions = {}
  ): Promise<string | null> => {
    console.log('Retrying file upload...');
    return uploadFile(file, instruction, options);
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

      return data ? {
        ...data,
        status: data.status as 'pending' | 'processing' | 'completed' | 'error'
      } : null;
    } catch (error) {
      console.error('Failed to fetch analysis record:', error);
      return null;
    }
  }, []);

  const associateToDuplicate = useCallback(async (
    duplicateId: string,
    projectId?: string,
    tags?: string[]
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Link to project if specified
      if (projectId) {
        await supabase
          .from('document_projects')
          .insert({
            analysis_record_id: duplicateId,
            project_id: projectId,
          });
      }

      // Link to tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // First try to find existing tag
          let { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .eq('user_id', session?.user?.id || '')
            .single();

          let tagId = existingTag?.id;

          // Create tag if it doesn't exist
          if (!tagId && session?.user?.id) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: session.user.id })
              .select('id')
              .single();

            if (!tagError) {
              tagId = newTag.id;
            }
          }

          // Link document to tag
          if (tagId) {
            await supabase
              .from('document_tags')
              .insert({
                analysis_record_id: duplicateId,
                tag_id: tagId,
              });
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to associate duplicate:', error);
      return false;
    }
  }, []);

  return {
    uploadFile,
    retryUpload,
    checkAnalysisStatus,
    associateToDuplicate,
    isUploading,
    uploadProgress,
    error,
    duplicateInfo,
    clearDuplicate: () => setDuplicateInfo(null),
  };
};
