
import { useState, useEffect, useMemo } from 'react';
import { KnowledgeDocument, LibraryFilters } from './useKnowledgeLibrary';

export const useLibrarySearch = (documents: KnowledgeDocument[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LibraryFilters>({});

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = doc.file_name.toLowerCase().includes(searchLower);
        const matchesInstruction = doc.instruction.toLowerCase().includes(searchLower);
        const matchesProject = doc.projects?.some(p => 
          p.name.toLowerCase().includes(searchLower)
        );
        const matchesTags = doc.tags?.some(t => 
          t.name.toLowerCase().includes(searchLower)
        );
        
        if (!matchesName && !matchesInstruction && !matchesProject && !matchesTags) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && doc.status !== filters.status) {
        return false;
      }

      // Project filter
      if (filters.projectId && !doc.projects?.some(p => p.id === filters.projectId)) {
        return false;
      }

      // Tag filter
      if (filters.tagId && !doc.tags?.some(t => t.id === filters.tagId)) {
        return false;
      }

      return true;
    });
  }, [documents, searchTerm, filters]);

  const searchResults = {
    documents: filteredDocuments,
    total: filteredDocuments.length,
    hasFilters: Object.keys(filters).length > 0 || searchTerm.length > 0
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    searchResults
  };
};
