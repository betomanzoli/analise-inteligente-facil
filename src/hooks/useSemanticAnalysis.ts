
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SemanticAnalysisOptions {
  query: string;
  contextDocuments?: string[];
}

export const useSemanticAnalysis = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = useCallback(async (
    query: string,
    options: SemanticAnalysisOptions = { query }
  ): Promise<string | null> => {
    if (!query.trim()) {
      setError('Consulta não pode estar vazia');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Iniciando análise semântica:', query);

      // Criar registro de análise para tracking
      const analysisData = {
        file_name: `Análise IA: ${query.substring(0, 50)}...`,
        file_path: 'semantic-analysis',
        file_size: 0,
        file_hash: `semantic-${Date.now()}-${Math.random()}`,
        instruction: query,
        status: 'processing' as const,
        user_id: user?.id || null,
        processing_timeout: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes timeout
      };

      const { data: recordData, error: recordError } = await supabase
        .from('analysis_records')
        .insert(analysisData)
        .select()
        .single();

      if (recordError) {
        throw new Error(`Erro ao criar registro: ${recordError.message}`);
      }

      console.log('Registro de análise criado:', recordData.id);

      // Chamar a Edge Function para análise semântica
      const { data, error: functionError } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'semantic-search',
          analysis_id: recordData.id,
          query: query.trim(),
          user_id: user?.id || null,
          contextDocuments: options.contextDocuments || [],
        },
      });

      if (functionError) {
        // Atualizar registro com erro
        await supabase
          .from('analysis_records')
          .update({
            status: 'error',
            error_message: functionError.message,
            updated_at: new Date().toISOString(),
            processing_timeout: null
          })
          .eq('id', recordData.id);

        throw new Error(`Erro na análise: ${functionError.message}`);
      }

      console.log('Análise semântica iniciada com sucesso');
      return recordData.id;

    } catch (error) {
      console.error('Falha na análise semântica:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na análise';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user]);

  return {
    performAnalysis,
    isAnalyzing,
    error,
    clearError: () => setError(null),
  };
};
