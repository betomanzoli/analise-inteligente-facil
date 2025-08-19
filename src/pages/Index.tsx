
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { EnhancedAnalysisForm } from '@/components/EnhancedAnalysisForm';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';

const Index = () => {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const handleAnalysisStart = (analysisId: string) => {
    setCurrentAnalysisId(analysisId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Formulário de análise */}
          <section className="bg-surface-elevated rounded-2xl p-8 shadow-medium">
            <EnhancedAnalysisForm onAnalysisStart={handleAnalysisStart} />
          </section>

          {/* Área de resultados */}
          <section>
            <EnhancedAnalysisResult
              analysisId={currentAnalysisId}
            />
          </section>
        </div>
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

export default Index;
