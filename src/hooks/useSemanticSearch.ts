
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AnalysisRecord } from './useAnalysisHistory';

export interface SearchResult {
  document: AnalysisRecord;
  similarity: number;
  relevantExcerpt: string;
}

export const useSemanticSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchDocuments = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!user || !query.trim()) return [];

    setIsSearching(true);
    
    try {
      // First, get all completed analyses for the user
      const { data: analyses, error } = await supabase
        .from('analysis_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('result', 'is', null);

      if (error) throw error;

      // For now, we'll do a simple text-based search
      // In a production environment, you would use vector embeddings
      const results: SearchResult[] = [];

      analyses?.forEach((analysis) => {
        const content = analysis.result?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        if (content.includes(queryLower)) {
          // Find the most relevant excerpt
          const index = content.indexOf(queryLower);
          const start = Math.max(0, index - 100);
          const end = Math.min(content.length, index + 200);
          const excerpt = analysis.result?.substring(start, end) || '';
          
          // Simple similarity score based on query frequency
          const matches = (content.match(new RegExp(queryLower, 'g')) || []).length;
          const similarity = Math.min(matches / 10, 1);
          
          results.push({
            document: {
              ...analysis,
              status: analysis.status as 'pending' | 'processing' | 'completed' | 'error'
            },
            similarity,
            relevantExcerpt: excerpt
          });
        }
      });

      // Sort by similarity score
      return results.sort((a, b) => b.similarity - a.similarity);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  const { data: searchResults = [], refetch } = useQuery({
    queryKey: ['semantic-search', searchQuery, user?.id],
    queryFn: () => searchDocuments(searchQuery),
    enabled: !!searchQuery && !!user,
  });

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      refetch();
    }
  }, [refetch]);

  return {
    searchResults,
    isSearching,
    performSearch,
    searchQuery,
  };
};
