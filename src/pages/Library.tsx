
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { KnowledgeLibrary } from '@/components/KnowledgeLibrary';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Library = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleViewDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleBackToLibrary = () => {
    setSelectedDocumentId(null);
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
        {selectedDocumentId ? (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToLibrary}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar à Biblioteca</span>
            </Button>
            
            <EnhancedAnalysisResult analysisId={selectedDocumentId} />
          </div>
        ) : (
          <KnowledgeLibrary onViewDocument={handleViewDocument} />
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
