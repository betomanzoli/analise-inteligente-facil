
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BatchUploadProgress {
  totalFiles: number;
  completedFiles: number;
  currentFileName: string;
  percentage: number;
  stage: string;
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

  const uploadBatch = useCallback(async (
    files: File[], 
    metadata: BatchMetadata
  ): Promise<string[]> => {
    console.log('Starting batch upload process...', { fileCount: files.length, metadata });
    
    setIsUploading(true);
    setError(null);
    
    const batchId = crypto.randomUUID();
    const analysisIds: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setBatchProgress({
          totalFiles: files.length,
          completedFiles: i,
          currentFileName: file.name,
          percentage: Math.round((i / files.length) * 100),
          stage: `Processando ${file.name}...`
        });

        // Upload to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro no upload de ${file.name}: ${uploadError.message}`);
        }

        // Create analysis record with metadata
        const analysisData = {
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          instruction: metadata.instruction,
          project_name: metadata.projectName,
          batch_id: batchId,
          status: 'pending' as const,
          user_id: session?.user?.id || null,
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

        // Trigger webhook for processing
        const webhookResponse = await fetch('https://hook.us2.make.com/5qwckbipv8xz9v2pcfxlhyk81tkclyh2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis_id: recordData.id,
            file_path: uploadData.path,
            file_name: file.name,
            instruction: metadata.instruction,
            user_id: session?.user?.id || null,
            batch_id: batchId,
            project_name: metadata.projectName,
          }),
        });

        if (!webhookResponse.ok) {
          console.error(`Webhook failed for ${file.name}:`, webhookResponse.status);
        }
      }

      setBatchProgress({
        totalFiles: files.length,
        completedFiles: files.length,
        currentFileName: '',
        percentage: 100,
        stage: 'Upload em lote concluído!'
      });

      setTimeout(() => setBatchProgress(null), 2000);
      
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
  }, []);

  return {
    uploadBatch,
    isUploading,
    batchProgress,
    error,
  };
};
