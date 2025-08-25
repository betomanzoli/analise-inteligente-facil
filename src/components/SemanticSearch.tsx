
import React, { useState } from 'react';
import { Search, FileText, ArrowRight, Sparkles, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

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
    if (similarity > 0.8) return 'bg-emerald-500';
    if (similarity > 0.6) return 'bg-blue-500';
    if (similarity > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSimilarityText = (similarity: number) => {
    if (similarity > 0.8) return 'Muito Alta';
    if (similarity > 0.6) return 'Alta';
    if (similarity > 0.4) return 'Média';
    return 'Baixa';
  };

  const getSimilarityPercentage = (similarity: number) => {
    return Math.round(similarity * 100);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gradient-to-r from-blue-200 to-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span>Busca Semântica Inteligente</span>
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              IA Vetorial
            </Badge>
          </CardTitle>
          <CardDescription>
            Encontre conhecimento usando linguagem natural. A IA entende o contexto e significado das suas perguntas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ex: 'Como melhorar a eficácia do medicamento?', 'Efeitos colaterais em idosos', 'Dosagem recomendada'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!query.trim() || isSearching} className="bg-gradient-to-r from-blue-500 to-purple-600">
              {isSearching ? (
                <>
                  <Sparkles className="animate-spin h-4 w-4 mr-2" />
                  Buscando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {(searchResults.length > 0 || isSearching) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span>Conhecimento Encontrado</span>
            </CardTitle>
            <CardDescription>
              {isSearching ? (
                'Analisando sua consulta com IA...'
              ) : (
                `${searchResults.length} fragmento(s) de conhecimento encontrado(s) para "${query}"`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {isSearching ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  searchResults.map((result, index) => (
                    <Card 
                      key={`${result.chunkId}-${index}`}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                      onClick={() => onSelectDocument(result.document.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-base">
                                {result.document.file_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Criado em {new Date(result.document.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <div className="text-center">
                              <div className={`w-3 h-3 rounded-full ${getSimilarityColor(result.similarity)} mb-1`} />
                              <Badge variant="outline" className="text-xs">
                                {getSimilarityText(result.similarity)}
                              </Badge>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {/* Similarity Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Relevância Semântica</span>
                            <span className="font-medium">{getSimilarityPercentage(result.similarity)}%</span>
                          </div>
                          <Progress 
                            value={getSimilarityPercentage(result.similarity)} 
                            className="h-2"
                          />
                        </div>
                        
                        {/* Content Preview */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm leading-relaxed text-gray-800">
                            "{result.relevantExcerpt.length > 300 
                              ? result.relevantExcerpt.substring(0, 300) + '...' 
                              : result.relevantExcerpt}"
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Brain className="h-3 w-3" />
                            <span>Correspondência IA: {getSimilarityPercentage(result.similarity)}%</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <FileText className="h-4 w-4 mr-1" />
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
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum conhecimento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              A IA não encontrou conteúdo semanticamente relacionado à sua consulta.
            </p>
            <p className="text-sm text-muted-foreground">
              Tente reformular sua pergunta ou usar termos diferentes. A busca semântica funciona melhor com perguntas específicas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {!query && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Dicas para Busca Semântica Eficaz</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Faça perguntas específicas como "Qual a dosagem para crianças?"</li>
                  <li>• Use contexto: "Efeitos colaterais do medicamento X em idosos"</li>
                  <li>• A IA entende sinônimos e conceitos relacionados</li>
                  <li>• Quanto mais específica a pergunta, melhor o resultado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
