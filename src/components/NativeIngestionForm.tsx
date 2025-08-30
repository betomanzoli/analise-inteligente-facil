
import React, { useState } from 'react';
import { EnhancedFileUpload } from './EnhancedFileUpload';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Zap, Upload } from 'lucide-react';
import { useNativeIngestion } from '@/hooks/useNativeIngestion';
import { Project } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface NativeIngestionFormProps {
  onIngestionStart: (analysisId: string) => void;
}

export const NativeIngestionForm: React.FC<NativeIngestionFormProps> = ({
  onIngestionStart
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { ingestDocument, isProcessing, progress, error } = useNativeIngestion();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Arquivo necessário",
        description: "Por favor, selecione um arquivo para ingestão.",
        variant: "destructive",
      });
      return;
    }

    const analysisId = await ingestDocument(selectedFile, {
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      tags: selectedTags,
    });
    
    if (analysisId) {
      onIngestionStart(analysisId);
      // Reset form
      setSelectedFile(null);
      setSelectedProject(null);
      setSelectedTags([]);
    }
  };

  const canStartIngestion = selectedFile && !isProcessing;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-card-title flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          1. Ingestão Nativa Avançada
        </h3>
        <p className="text-subtle">
          Sistema nativo com OCR avançado usando Google Cloud Vision API para máxima precisão na extração de texto.
        </p>
        
        <EnhancedFileUpload
          onFileChange={setSelectedFile}
          acceptedTypes=".pdf"
          maxSize={25}
          isUploading={isProcessing}
        />
      </div>

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

      {progress && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Processamento Nativo</span>
            <span className="text-sm text-muted-foreground">
              {progress.percentage}%
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progress.stage}
            </p>
            {progress.details && (
              <p className="text-xs text-subtle">
                {progress.details}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canStartIngestion}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processando com OCR Avançado...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Iniciar Ingestão Nativa</span>
          </>
        )}
      </button>
    </form>
  );
};
