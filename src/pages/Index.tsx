
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { IngestionForm } from '@/components/IngestionForm';
import { AIAnalysisForm } from '@/components/AIAnalysisForm';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { AnalysisHistorySidebar } from '@/components/AnalysisHistorySidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentAnalysisIds, setCurrentAnalysisIds] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('ingestion');
  
  const { user } = useAuth();

  const handleIngestionComplete = (analysisId: string | string[]) => {
    const ids = Array.isArray(analysisId) ? analysisId : [analysisId];
    setCurrentAnalysisIds(ids);
    // Manter na aba de ingestão para mostrar o progresso
  };

  const handleAnalysisStart = (analysisId: string) => {
    setCurrentAnalysisIds([analysisId]);
    // Mudar para mostrar o resultado da análise
  };

  const handleSelectAnalysis = (analysisId: string) => {
    setCurrentAnalysisIds([analysisId]);
    setShowHistory(false); // Close on mobile
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistoryButton={!!user}
      />
      
      <div className="flex">
        {/* History Sidebar */}
        {user && (
          <AnalysisHistorySidebar
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            onSelectAnalysis={handleSelectAnalysis}
            selectedAnalysisId={currentAnalysisIds[0] || null}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="ingestion" className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Ingestão</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Análise IA</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ingestion">
                <section className="bg-surface-elevated rounded-2xl p-8 shadow-medium">
                  <IngestionForm onIngestionComplete={handleIngestionComplete} />
                </section>
              </TabsContent>
              
              <TabsContent value="analysis">
                <section className="bg-surface-elevated rounded-2xl p-8 shadow-medium">
                  <AIAnalysisForm onAnalysisStart={handleAnalysisStart} />
                </section>
              </TabsContent>
            </Tabs>

            {/* Results Area */}
            {currentAnalysisIds.length > 0 && (
              <section>
                {currentAnalysisIds.length === 1 ? (
                  <EnhancedAnalysisResult
                    analysisId={currentAnalysisIds[0]}
                  />
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-section-title">
                      Ingestão em Lote ({currentAnalysisIds.length} documentos)
                    </h2>
                    <div className="grid gap-6">
                      {currentAnalysisIds.map((analysisId, index) => (
                        <div key={analysisId} className="border rounded-lg p-4">
                          <h3 className="text-lg font-medium mb-4">
                            Documento {index + 1}
                          </h3>
                          <EnhancedAnalysisResult
                            analysisId={analysisId}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border bg-surface-subtle">
        <div className="container mx-auto px-6 py-8 text-center text-subtle">
          <p>© 2024 Plataforma de Análise Inteligente • Desenvolvido com ❤️ e IA</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
