
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NativeIngestionForm } from './NativeIngestionForm';
import { AIAnalysisInterface } from './AIAnalysisInterface';
import { EnhancedAnalysisForm } from './EnhancedAnalysisForm';
import { Upload, Sparkles, FileText, Zap } from 'lucide-react';

interface UnifiedAnalysisInterfaceProps {
  onAnalysisStart: (analysisId: string | string[]) => void;
}

export const UnifiedAnalysisInterface: React.FC<UnifiedAnalysisInterfaceProps> = ({
  onAnalysisStart
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-card-title mb-4">
          Sistema de Análise Documental IA
        </h2>
        <p className="text-lg text-subtle max-w-2xl mx-auto">
          Escolha entre ingestão nativa avançada, análise IA inteligente ou upload tradicional para processar seus documentos.
        </p>
      </div>

      <Tabs defaultValue="native" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="native" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Ingestão Nativa
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Análise IA
          </TabsTrigger>
          <TabsTrigger value="traditional" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Tradicional
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="native" className="mt-8">
          <div className="bg-card/50 rounded-lg border p-6">
            <NativeIngestionForm onIngestionStart={onAnalysisStart} />
          </div>
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="mt-8">
          <div className="bg-card/50 rounded-lg border p-6">
            <AIAnalysisInterface onAnalysisStart={onAnalysisStart} />
          </div>
        </TabsContent>
        
        <TabsContent value="traditional" className="mt-8">
          <div className="bg-card/50 rounded-lg border p-6">
            <EnhancedAnalysisForm onAnalysisStart={onAnalysisStart} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
