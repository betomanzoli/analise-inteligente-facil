
import React, { useState } from 'react';
import { EnhancedFileUpload } from './EnhancedFileUpload';
import { BatchUploadForm } from './BatchUploadForm';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/hooks/useProjects';

interface EnhancedAnalysisFormProps {
  onAnalysisStart: (analysisId: string | string[]) => void;
}

export const EnhancedAnalysisForm: React.FC<EnhancedAnalysisFormProps> = ({
  onAnalysisStart
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { uploadFile, uploadProgress, isUploading } = useFileUpload();

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !instruction.trim()) {
      return;
    }

    const analysisId = await uploadFile(selectedFile, instruction);
    if (analysisId) {
      onAnalysisStart(analysisId);
    }
  };

  const handleBatchStart = (analysisIds: string[]) => {
    onAnalysisStart(analysisIds);
  };

  const canStartSingleAnalysis = selectedFile && instruction.trim() && !isUploading;

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single">Arquivo Único</TabsTrigger>
        <TabsTrigger value="batch">Upload em Lote</TabsTrigger>
      </TabsList>
      
      <TabsContent value="single" className="mt-6">
        <form onSubmit={handleSingleSubmit} className="space-y-8">
          <EnhancedFileUpload
            onFileChange={setSelectedFile}
            acceptedTypes=".pdf"
            maxSize={25}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />

          <div className="space-y-6">
            <h3 className="text-card-title">2. Organização dos Documentos</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-card-title">
                  Projeto (opcional)
                </label>
                <ProjectSelector
                  value={selectedProject}
                  onChange={setSelectedProject}
                  placeholder="Selecionar projeto..."
                />
                <p className="text-xs text-subtle">
                  Organize seus documentos por projetos para facilitar a gestão
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-card-title">
                  Tags (opcional)
                </label>
                <TagInput
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Adicionar tags..."
                />
                <p className="text-xs text-subtle">
                  Adicione tags para categorizar e encontrar documentos facilmente
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-card-title">
              3. Descreva a análise que você precisa
            </label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Exemplo: Faça um resumo executivo do documento, identifique os pontos principais e forneça recomendações estratégicas..."
              className="min-h-[120px] resize-none text-base"
              disabled={isUploading}
            />
            <p className="text-subtle">
              Seja específico sobre que tipo de análise, resumo ou insights você precisa.
            </p>
          </div>

          <button
            type="submit"
            disabled={!canStartSingleAnalysis}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Iniciar Análise</span>
              </>
            )}
          </button>
        </form>
      </TabsContent>
      
      <TabsContent value="batch" className="mt-6">
        <BatchUploadForm onBatchStart={handleBatchStart} />
      </TabsContent>
    </Tabs>
  );
};
