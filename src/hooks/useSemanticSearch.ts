
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { AnalysisRecord } from './useAnalysisHistory';
import { useVectorSearch, VectorSearchResult } from './useVectorSearch';

export interface SearchResult {
  document: AnalysisRecord;
  similarity: number;
  relevantExcerpt: string;
  chunkId: string;
  metadata: any;
}

export const useSemanticSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { performVectorSearch, isSearching: isVectorSearching } = useVectorSearch();

  const searchDocuments = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!user || !query.trim()) return [];

    console.log('Starting semantic search for:', query);
    
    try {
      // Perform vector search
      const vectorResults = await performVectorSearch(query, {
        matchThreshold: 0.6, // Slightly lower threshold for more results
        matchCount: 20
      });

      // Transform vector results to SearchResult format
      const results: SearchResult[] = vectorResults.map((result: VectorSearchResult) => ({
        document: {
          id: result.analysis_record_id,
          file_name: result.file_name,
          created_at: result.created_at,
          status: 'completed' as const,
          instruction: '',
          file_path: '',
          file_size: 0,
          updated_at: result.created_at,
          result: result.content
        },
        similarity: result.similarity,
        relevantExcerpt: result.content,
        chunkId: result.id,
        metadata: result.metadata || {}
      }));

      console.log('Semantic search completed:', results.length, 'results');
      return results.sort((a, b) => b.similarity - a.similarity);

    } catch (error) {
      console.error('Semantic search failed:', error);
      return [];
    }
  }, [user, performVectorSearch]);

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
    isSearching: isVectorSearching,
    performSearch,
    searchQuery,
  };
};
