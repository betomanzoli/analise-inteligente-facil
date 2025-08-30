
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RAGAnalysisResult {
  result: string;
  confidence_level: 'Alto' | 'Médio' | 'Baixo';
  sources_count: number;
  analysis_id: string;
  agent_version: string;
}

export interface RAGAnalysisStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export const useRAGAnalysis = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<RAGAnalysisStep[]>([]);

  const updateStep = useCallback((stepName: string, status: RAGAnalysisStep['status'], message?: string) => {
    setSteps(prev => prev.map(step => 
      step.name === stepName ? { ...step, status, message } : step
    ));
  }, []);

  const initializeSteps = useCallback(() => {
    setSteps([
      { name: 'Preparação da consulta', status: 'pending' },
      { name: 'Geração de embedding', status: 'pending' },
      { name: 'Busca semântica', status: 'pending' },
      { name: 'Análise com Master Agent v7.0', status: 'pending' },
      { name: 'Formatação dos resultados', status: 'pending' }
    ]);
  }, []);

  const performRAGAnalysis = useCallback(async (query: string): Promise<RAGAnalysisResult | null> => {
    if (!user || !query.trim()) {
      setError('Usuário não autenticado ou consulta vazia');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);
    initializeSteps();

    try {
      // Step 1: Preparação da consulta
      updateStep('Preparação da consulta', 'running');
      
      // Criar registro de análise
      const analysisData = {
        file_name: `Análise RAG: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`,
        file_path: 'rag-analysis',
        file_size: 0,
        file_hash: `rag-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        instruction: query,
        status: 'processing' as const,
        user_id: user.id,
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

      updateStep('Preparação da consulta', 'completed', 'Registro criado');

      // Step 2: Geração de embedding
      updateStep('Geração de embedding', 'running');
      
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
        body: { text: query }
      });

      if (embeddingError || !embeddingData.success) {
        throw new Error('Falha na geração de embedding');
      }

      updateStep('Geração de embedding', 'completed', 'Embedding gerado');

      // Step 3: Busca semântica
      updateStep('Busca semântica', 'running');
      
      const { data: searchData, error: searchError } = await supabase.functions.invoke('semantic-search', {
        body: {
          query: query.trim(),
          matchThreshold: 0.65, // Otimizado para melhor recall
          matchCount: 15, // Mais chunks para análise rica
          userId: user.id
        }
      });

      if (searchError || !searchData.success) {
        throw new Error('Falha na busca semântica');
      }

      const searchResults = searchData.results || [];
      updateStep('Busca semântica', 'completed', `${searchResults.length} chunks encontrados`);

      // Step 4: Análise com Master Agent v7.0
      updateStep('Análise com Master Agent v7.0', 'running');
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('master-agent', {
        body: {
          action: 'analyze',
          analysis_id: recordData.id,
          query: query.trim(),
          search_results: searchResults
        }
      });

      if (analysisError || !analysisData.success) {
        throw new Error(`Falha na análise: ${analysisError?.message || 'Erro desconhecido'}`);
      }

      updateStep('Análise com Master Agent v7.0', 'completed', 'Análise concluída');

      // Step 5: Formatação dos resultados
      updateStep('Formatação dos resultados', 'running');

      const result: RAGAnalysisResult = {
        result: analysisData.result,
        confidence_level: analysisData.confidence_level || 'Médio',
        sources_count: analysisData.sources_count || 0,
        analysis_id: analysisData.analysis_id,
        agent_version: analysisData.agent_version || '7.0'
      };

      updateStep('Formatação dos resultados', 'completed', 'Pronto');

      console.log('RAG Analysis completed:', result);
      return result;

    } catch (error) {
      console.error('RAG Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na análise RAG';
      setError(errorMessage);
      
      // Update current running step to error
      setSteps(prev => prev.map(step => 
        step.status === 'running' ? { ...step, status: 'error', message: errorMessage } : step
      ));
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, updateStep, initializeSteps]);

  return {
    performRAGAnalysis,
    isAnalyzing,
    error,
    steps,
    clearError: () => setError(null),
  };
};
