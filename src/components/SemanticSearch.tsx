
import React, { useState } from 'react';
import { Search, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { Skeleton } from '@/components/ui/skeleton';

interface SemanticSearchProps {
  onSelectDocument: (documentId: string) => void;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({ onSelectDocument }) => {
  const [query, setQuery] = useState('');
  const { searchResults, isSearching, performSearch } = useSemanticSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity > 0.7) return 'bg-green-500';
    if (similarity > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSimilarityText = (similarity: number) => {
    if (similarity > 0.7) return 'Alta';
    if (similarity > 0.4) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Busca Semântica Inteligente</span>
          </CardTitle>
          <CardDescription>
            Encontre documentos usando linguagem natural e conceitos relacionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ex: 'análise financeira', 'problemas de performance', 'recomendações estratégicas'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!query.trim() || isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {(searchResults.length > 0 || isSearching) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados da Busca</CardTitle>
            <CardDescription>
              {searchResults.length} documento(s) encontrado(s) para "{query}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {isSearching ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))
                ) : (
                  searchResults.map((result) => (
                    <Card 
                      key={result.document.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectDocument(result.document.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 flex-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium truncate">
                              {result.document.file_name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <div className={`w-2 h-2 rounded-full ${getSimilarityColor(result.similarity)}`} />
                            <Badge variant="secondary" className="text-xs">
                              {getSimilarityText(result.similarity)}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Criado em {new Date(result.document.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {result.relevantExcerpt && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm leading-relaxed">
                              ...{result.relevantExcerpt}...
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-muted-foreground">
                            Similaridade: {Math.round(result.similarity * 100)}%
                          </div>
                          <Button variant="ghost" size="sm">
                            Ver Documento
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && query && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground">
              Tente reformular sua busca ou usar termos diferentes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
