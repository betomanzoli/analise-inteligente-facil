
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { EnhancedAnalysisForm } from '@/components/EnhancedAnalysisForm';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { useFileUpload } from '@/hooks/useFileUpload';

const Index = () => {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadInstruction, setUploadInstruction] = useState<string>('');
  
  const { uploadProgress, error, isUploading, retryUpload } = useFileUpload();

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
              uploadProgress={uploadProgress}
              uploadError={error}
              onRetryUpload={handleRetryUpload}
              isRetrying={isUploading}
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
