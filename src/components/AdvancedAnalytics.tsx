
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { SemanticSearch } from './SemanticSearch';
import { DocumentComparison } from './DocumentComparison';
import { useAnalysisHistory, AnalysisRecord } from '@/hooks/useAnalysisHistory';
import { Search, GitCompare, FileText, Sparkles, TrendingUp } from 'lucide-react';

interface AdvancedAnalyticsProps {
  onSelectDocument: (documentId: string) => void;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ onSelectDocument }) => {
  const { data: analyses = [] } = useAnalysisHistory();
  const [selectedDocuments, setSelectedDocuments] = useState<AnalysisRecord[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const completedAnalyses = analyses.filter(analysis => analysis.status === 'completed' && analysis.result);

  const handleDocumentSelect = (document: AnalysisRecord, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, document]);
    } else {
      setSelectedDocuments(prev => prev.filter(d => d.id !== document.id));
    }
  };

  const startComparison = () => {
    if (selectedDocuments.length >= 2) {
      setShowComparison(true);
    }
  };

  const closeComparison = () => {
    setShowComparison(false);
    setSelectedDocuments([]);
  };

  if (showComparison) {
    return (
      <DocumentComparison
        documents={selectedDocuments}
        onClose={closeComparison}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Analytics Avançado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{completedAnalyses.length}</div>
              <div className="text-sm text-muted-foreground">Documentos Processados</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{selectedDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Selecionados para Comparação</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Math.round(completedAnalyses.reduce((sum, doc) => sum + (doc.result?.length || 0), 0) / 1000)}K
              </div>
              <div className="text-sm text-muted-foreground">Caracteres Analisados</div>
            </div>
          </div>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Busca Semântica</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center space-x-2">
                <GitCompare className="h-4 w-4" />
                <span>Comparar Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-6">
              <SemanticSearch onSelectDocument={onSelectDocument} />
            </TabsContent>

            <TabsContent value="compare" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Selecionar Documentos para Comparação</h3>
                  <Button 
                    onClick={startComparison}
                    disabled={selectedDocuments.length < 2}
                  >
                    Comparar ({selectedDocuments.length})
                  </Button>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {completedAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedDocuments.some(d => d.id === analysis.id)}
                            onCheckedChange={(checked) => 
                              handleDocumentSelect(analysis, checked as boolean)
                            }
                          />
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <h4 className="font-medium">{analysis.file_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {Math.round((analysis.result?.length || 0) / 1000)}K chars
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insights Automáticos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {completedAnalyses.length > 5 && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            Você tem um grande volume de análises! Considere usar a busca semântica para encontrar padrões.
                          </span>
                        </div>
                      )}
                      
                      {selectedDocuments.length >= 2 && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                          <GitCompare className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            Documentos selecionados para comparação. Clique em "Comparar" para identificar temas comuns.
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          Seus documentos contêm aproximadamente{' '}
                          {Math.round(completedAnalyses.reduce((sum, doc) => sum + (doc.result?.length || 0), 0) / 5000)} páginas de conteúdo analisado.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
