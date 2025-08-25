
import React, { useState } from 'react';
import { BatchFileUpload } from './BatchFileUpload';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useBatchUpload } from '@/hooks/useBatchUpload';
import { Project } from '@/hooks/useProjects';

interface BatchUploadFormProps {
  onBatchStart: (analysisIds: string[]) => void;
}

export const BatchUploadForm: React.FC<BatchUploadFormProps> = ({
  onBatchStart
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [instruction, setInstruction] = useState('');
  
  const { uploadBatch, isUploading, batchProgress } = useBatchUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0 || !instruction.trim()) {
      return;
    }

    const metadata = {
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      tags,
      instruction: instruction.trim(),
    };

    const analysisIds = await uploadBatch(selectedFiles, metadata);
    if (analysisIds.length > 0) {
      onBatchStart(analysisIds);
    }
  };

  const canStartUpload = selectedFiles.length > 0 && instruction.trim() && !isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <BatchFileUpload
        onFilesChange={setSelectedFiles}
        acceptedTypes=".pdf"
        maxSize={25}
        maxFiles={20}
        isUploading={isUploading}
      />

      <div className="space-y-4">
        <label className="block text-card-title">
          2. Organização dos Documentos
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Projeto (opcional)
            </label>
            <ProjectSelector
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Selecionar ou criar projeto..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Agrupe documentos relacionados em projetos
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (opcional)
            </label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Adicionar tags..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use tags para categorizar e encontrar documentos
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
          placeholder="Exemplo: Faça um resumo executivo dos documentos, identifique os pontos principais e forneça recomendações estratégicas para cada um..."
          className="min-h-[120px] resize-none text-base"
          disabled={isUploading}
        />
        <p className="text-subtle">
          Esta instrução será aplicada a todos os arquivos do lote.
        </p>
      </div>

      {batchProgress && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Upload em Progresso</span>
            <span className="text-sm text-muted-foreground">
              {batchProgress.completedFiles}/{batchProgress.totalFiles} arquivos
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{batchProgress.stage}</span>
              <span className="text-muted-foreground">{batchProgress.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${batchProgress.percentage}%` }}
              />
            </div>
          </div>
          
          {batchProgress.currentFileName && (
            <p className="text-xs text-muted-foreground">
              Processando: {batchProgress.currentFileName}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!canStartUpload}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processando Lote...</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span>
              Iniciar Análise em Lote 
              {selectedFiles.length > 0 && ` (${selectedFiles.length} arquivo${selectedFiles.length !== 1 ? 's' : ''})`}
            </span>
          </>
        )}
      </button>
    </form>
  );
};
