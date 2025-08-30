
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { KnowledgeLibrary } from '@/components/KnowledgeLibrary';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { ArrowLeft, Search, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalysisRecord } from '@/hooks/useAnalysisHistory';

const Library = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('library');
  const { user } = useAuth();
  const { data: selectedAnalysis } = useAnalysisRecord(selectedDocumentId);

  const handleViewDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleBackToLibrary = () => {
    setSelectedDocumentId(null);
    setActiveTab('library');
  };

  const handleSelectFromAnalytics = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setActiveTab('library'); // Switch to library tab to show the document
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Faça login para acessar sua biblioteca de conhecimento.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {selectedDocumentId && selectedAnalysis ? (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToLibrary}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar à Biblioteca</span>
            </Button>
            
            <EnhancedAnalysisResult 
              analysis={selectedAnalysis} 
              onRefresh={() => {}} 
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="library" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Biblioteca</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics Avançado</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="library">
              <KnowledgeLibrary onViewDocument={handleViewDocument} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AdvancedAnalytics onSelectDocument={handleSelectFromAnalytics} />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-surface-subtle">
        <div className="container mx-auto px-6 py-8 text-center text-subtle">
          <p>© 2024 Plataforma de Análise Inteligente • Desenvolvido com ❤️ e IA</p>
        </div>
      </footer>
    </div>
  );
};

export default Library;
