
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AnalysisRecord } from '@/hooks/useAnalysisHistory';
import { ArrowLeftRight, FileText, Calendar } from 'lucide-react';

interface DocumentComparisonProps {
  documents: AnalysisRecord[];
  onClose: () => void;
}

export const DocumentComparison: React.FC<DocumentComparisonProps> = ({ documents, onClose }) => {
  const [selectedSections, setSelectedSections] = useState<{[docId: string]: string[]}>({});

  const extractSections = (content: string) => {
    const sections = content.split(/\n\n+/).filter(section => section.trim());
    return sections.slice(0, 10); // Limit to first 10 sections
  };

  const findCommonThemes = (docs: AnalysisRecord[]) => {
    const themes: {[theme: string]: number} = {};
    const commonWords = ['análise', 'documento', 'resultado', 'dados', 'informação', 'processo'];

    docs.forEach(doc => {
      if (doc.result) {
        const words = doc.result.toLowerCase().split(/\W+/);
        words.forEach(word => {
          if (word.length > 4 && !commonWords.includes(word)) {
            themes[word] = (themes[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(themes)
      .filter(([_, count]) => count >= docs.length / 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([theme]) => theme);
  };

  const commonThemes = findCommonThemes(documents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ArrowLeftRight className="h-5 w-5" />
          <h2 className="text-xl font-bold">Comparação de Documentos</h2>
          <Badge variant="secondary">{documents.length} documentos</Badge>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Fechar Comparação
        </Button>
      </div>

      {/* Common Themes */}
      {commonThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temas Comuns</CardTitle>
            <CardDescription>Conceitos que aparecem em múltiplos documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonThemes.map((theme, index) => (
                <Badge key={index} variant="outline">
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {documents.map((document) => (
          <Card key={document.id} className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <CardTitle className="text-base truncate">
                    {document.file_name}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="flex items-center space-x-2 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{new Date(document.created_at).toLocaleDateString('pt-BR')}</span>
              </CardDescription>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {extractSections(document.result || '').map((section, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        const current = selectedSections[document.id] || [];
                        const sectionText = section.substring(0, 50);
                        setSelectedSections(prev => ({
                          ...prev,
                          [document.id]: current.includes(sectionText) 
                            ? current.filter(s => s !== sectionText)
                            : [...current, sectionText]
                        }));
                      }}
                    >
                      <p className="text-sm leading-relaxed">
                        {section.length > 200 ? section.substring(0, 200) + '...' : section}
                      </p>
                      {commonThemes.some(theme => 
                        section.toLowerCase().includes(theme.toLowerCase())
                      ) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {commonThemes
                            .filter(theme => section.toLowerCase().includes(theme.toLowerCase()))
                            .map((theme, themeIndex) => (
                              <Badge key={themeIndex} variant="secondary" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo da Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{documents.length}</div>
              <div className="text-sm text-muted-foreground">Documentos Comparados</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{commonThemes.length}</div>
              <div className="text-sm text-muted-foreground">Temas em Comum</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Math.round(documents.reduce((sum, doc) => sum + (doc.result?.length || 0), 0) / 1000)}K
              </div>
              <div className="text-sm text-muted-foreground">Caracteres Analisados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
