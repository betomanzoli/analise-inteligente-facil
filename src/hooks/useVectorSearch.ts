
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VectorSearchResult {
  id: string;
  analysis_record_id: string;
  content: string;
  similarity: number;
  metadata: any;
  file_name: string;
  created_at: string;
}

export const useVectorSearch = () => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performVectorSearch = useCallback(async (
    query: string,
    options: {
      matchThreshold?: number;
      matchCount?: number;
    } = {}
  ): Promise<VectorSearchResult[]> => {
    if (!user || !query.trim()) return [];

    setIsSearching(true);
    setError(null);
    
    try {
      console.log('Performing vector search for:', query);

      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: {
          query: query.trim(),
          matchThreshold: options.matchThreshold || 0.7,
          matchCount: options.matchCount || 10,
          userId: user.id
        }
      });

      if (error) {
        console.error('Vector search error:', error);
        throw new Error(error.message || 'Failed to perform search');
      }

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      console.log('Vector search completed:', data.results?.length || 0, 'results');
      return data.results || [];

    } catch (error) {
      console.error('Vector search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
      setError(errorMessage);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  return {
    performVectorSearch,
    isSearching,
    error,
  };
};
