
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { EnhancedAnalysisForm } from '@/components/EnhancedAnalysisForm';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { AnalysisHistorySidebar } from '@/components/AnalysisHistorySidebar';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadInstruction, setUploadInstruction] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  
  const { uploadProgress, error, isUploading, retryUpload } = useFileUpload();
  const { user } = useAuth();

  const handleAnalysisStart = (analysisId: string, file?: File, instruction?: string) => {
    setCurrentAnalysisId(analysisId);
    if (file) setUploadFile(file);
    if (instruction) setUploadInstruction(instruction);
  };

  const handleRetryUpload = () => {
    if (uploadFile && uploadInstruction) {
      retryUpload(uploadFile, uploadInstruction).then((analysisId) => {
        if (analysisId) {
          setCurrentAnalysisId(analysisId);
        }
      });
    }
  };

  const handleSelectAnalysis = (analysisId: string) => {
    setCurrentAnalysisId(analysisId);
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
            selectedAnalysisId={currentAnalysisId}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Formulário de análise */}
            <section className="bg-surface-elevated rounded-2xl p-8 shadow-medium">
              <EnhancedAnalysisForm onAnalysisStart={handleAnalysisStart} />
            </section>

            {/* Área de resultados */}
            <section>
              <EnhancedAnalysisResult
                analysisId={currentAnalysisId}
                uploadProgress={uploadProgress}
                uploadError={error}
                onRetryUpload={handleRetryUpload}
                isRetrying={isUploading}
              />
            </section>
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
