
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NativeIngestionProgress {
  stage: string;
  percentage: number;
  details?: string;
}

export const useNativeIngestion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<NativeIngestionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ingestDocument = useCallback(async (
    file: File,
    metadata: {
      projectId?: string;
      projectName?: string;
      tags?: string[];
    } = {}
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para ingerir documentos.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);
    setError(null);
    setProgress({ stage: 'Iniciando ingestão nativa...', percentage: 0 });

    try {
      // Calcular hash do arquivo
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('Starting native ingestion for:', file.name, 'Hash:', fileHash);

      // Verificar duplicatas
      setProgress({ stage: 'Verificando duplicatas...', percentage: 10 });
      
      const { data: duplicateCheck } = await supabase
        .from('analysis_records')
        .select('id, file_name')
        .eq('file_hash', fileHash)
        .single();

      if (duplicateCheck) {
        toast({
          title: "Documento duplicado",
          description: `Este documento já foi ingerido anteriormente: ${duplicateCheck.file_name}`,
          variant: "destructive",
        });
        return null;
      }

      // Upload do arquivo
      setProgress({ stage: 'Fazendo upload do arquivo...', percentage: 20 });
      
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Criar registro de análise
      setProgress({ stage: 'Criando registro de análise...', percentage: 30 });
      
      const analysisData = {
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_hash: fileHash,
        instruction: 'Processamento nativo com OCR avançado',
        project_name: metadata.projectName,
        status: 'processing' as const,
        user_id: user.id,
        processing_timeout: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes timeout
      };

      const { data: recordData, error: recordError } = await supabase
        .from('analysis_records')
        .insert(analysisData)
        .select()
        .single();

      if (recordError) {
        throw new Error(`Erro ao criar registro: ${recordError.message}`);
      }

      // Associar ao projeto se especificado
      if (metadata.projectId) {
        await supabase
          .from('document_projects')
          .insert({
            analysis_record_id: recordData.id,
            project_id: metadata.projectId,
          });
      }

      // Associar tags
      if (metadata.tags && metadata.tags.length > 0) {
        for (const tagName of metadata.tags) {
          let { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .eq('user_id', user.id)
            .single();

          let tagId = existingTag?.id;

          if (!tagId) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName, user_id: user.id })
              .select('id')
              .single();

            if (!tagError) {
              tagId = newTag.id;
            }
          }

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

      // Iniciar processamento nativo
      setProgress({ stage: 'Iniciando processamento com OCR avançado...', percentage: 50 });
      
      const { error: functionError } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'process',
          analysis_id: recordData.id,
          file_path: uploadData.path,
          file_name: file.name,
          instruction: 'Processamento nativo com OCR avançado',
          user_id: user.id,
          project_name: metadata.projectName,
          isBatchUpload: false,
        },
      });

      if (functionError) {
        console.error('Native processing failed:', functionError);
        throw new Error(`Falha no processamento: ${functionError.message}`);
      }

      setProgress({ stage: 'Processamento nativo iniciado com sucesso!', percentage: 100 });

      toast({
        title: "Ingestão iniciada",
        description: "O documento está sendo processado com OCR avançado. Você pode acompanhar o progresso no histórico.",
      });

      setTimeout(() => setProgress(null), 3000);
      
      return recordData.id;

    } catch (error) {
      console.error('Native ingestion failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na ingestão';
      setError(errorMessage);
      
      toast({
        title: "Erro na ingestão",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user, toast]);

  return {
    ingestDocument,
    isProcessing,
    progress,
    error,
    clearError: () => setError(null),
  };
};
