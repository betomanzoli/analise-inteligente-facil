
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFileHash } from './useFileHash';

interface BatchUploadProgress {
  totalFiles: number;
  completedFiles: number;
  currentFileName: string;
  percentage: number;
  stage: string;
  duplicatesFound: number;
  duplicateFiles: string[];
}

interface BatchMetadata {
  projectId?: string;
  projectName?: string;
  tags: string[];
  instruction: string;
}

export const useBatchUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { calculateHash } = useFileHash();

  const uploadBatch = useCallback(async (
    files: File[], 
    metadata: BatchMetadata
  ): Promise<string[]> => {
    console.log('Starting batch upload process...', { fileCount: files.length, metadata });
    
    setIsUploading(true);
    setError(null);
    
    const batchId = crypto.randomUUID();
    const analysisIds: string[] = [];
    let duplicatesFound = 0;
    const duplicateFiles: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setBatchProgress({
          totalFiles: files.length,
          completedFiles: i,
          currentFileName: file.name,
          percentage: Math.round((i / files.length) * 100),
          stage: `Verificando ${file.name}...`,
          duplicatesFound,
          duplicateFiles
        });

        // Calculate hash and check for duplicates
        const fileHash = await calculateHash(file);
        
        const { data: duplicateCheck } = await supabase
          .from('analysis_records')
          .select('id, file_name')
          .eq('file_hash', fileHash)
          .single();

        if (duplicateCheck) {
          duplicatesFound++;
          duplicateFiles.push(file.name);
          console.log(`Duplicate found for ${file.name}, skipping...`);
          continue;
        }

        setBatchProgress({
          totalFiles: files.length,
          completedFiles: i,
          currentFileName: file.name,
          percentage: Math.round((i / files.length) * 100),
          stage: `Processando ${file.name}...`,
          duplicatesFound,
          duplicateFiles
        });

        // Upload to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro no upload de ${file.name}: ${uploadError.message}`);
        }

        // Create analysis record with metadata and hash
        const analysisData = {
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_hash: fileHash,
          instruction: metadata.instruction,
          project_name: metadata.projectName,
          batch_id: batchId,
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
          throw new Error(`Erro ao criar registro para ${file.name}: ${recordError.message}`);
        }

        analysisIds.push(recordData.id);

        // Link to project if specified
        if (metadata.projectId) {
          await supabase
            .from('document_projects')
            .insert({
              analysis_record_id: recordData.id,
              project_id: metadata.projectId,
            });
        }

        // Link to tags
        for (const tagName of metadata.tags) {
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

        // Call Edge Function for processing
        const { error: functionError } = await supabase.functions.invoke('analyze-document', {
          body: {
            action: 'process',
            analysis_id: recordData.id,
            file_path: uploadData.path,
            file_name: file.name,
            instruction: metadata.instruction,
            user_id: session?.user?.id || null,
            batch_id: batchId,
            project_name: metadata.projectName,
            isBatchUpload: true,
          },
        });

        if (functionError) {
          console.error(`Processing failed for ${file.name}:`, functionError);
        }
      }

      setBatchProgress({
        totalFiles: files.length,
        completedFiles: files.length,
        currentFileName: '',
        percentage: 100,
        stage: `Upload em lote concluído! ${duplicatesFound > 0 ? `${duplicatesFound} duplicata(s) ignorada(s).` : ''}`,
        duplicatesFound,
        duplicateFiles
      });

      setTimeout(() => setBatchProgress(null), 3000);
      
      return analysisIds;

    } catch (error) {
      console.error('Batch upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload em lote';
      setError(errorMessage);
      setBatchProgress(null);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [calculateHash]);

  return {
    uploadBatch,
    isUploading,
    batchProgress,
    error,
  };
};
