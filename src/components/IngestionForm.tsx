
import React, { useState } from 'react';
import { EnhancedFileUpload } from './EnhancedFileUpload';
import { BatchUploadForm } from './BatchUploadForm';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { DuplicateDocumentDialog } from './DuplicateDocumentDialog';
import { Loader2, Upload, Database } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface IngestionFormProps {
  onIngestionComplete: (analysisId: string | string[]) => void;
}

export const IngestionForm: React.FC<IngestionFormProps> = ({
  onIngestionComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { 
    uploadFile, 
    uploadProgress, 
    isUploading, 
    duplicateInfo, 
    associateToDuplicate, 
    clearDuplicate 
  } = useFileUpload();
  const { toast } = useToast();

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo para ingerir.",
        variant: "destructive",
      });
      return;
    }

    // Para ingestão, usamos uma instrução padrão
    const defaultInstruction = "Processar e indexar documento na base de conhecimento";
    
    const analysisId = await uploadFile(selectedFile, defaultInstruction, {
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      tags: selectedTags,
      isIngestion: true, // Flag para identificar que é ingestão
    });
    
    if (analysisId) {
      onIngestionComplete(analysisId);
      // Reset form
      setSelectedFile(null);
      setSelectedProject(null);
      setSelectedTags([]);
      toast({
        title: "Documento ingerido",
        description: "O documento foi adicionado à base de conhecimento com sucesso.",
      });
    }
  };

  const handleBatchComplete = (analysisIds: string[]) => {
    onIngestionComplete(analysisIds);
    toast({
      title: "Ingestão em lote concluída",
      description: `${analysisIds.length} documentos foram adicionados à base de conhecimento.`,
    });
  };

  const handleAssociateDuplicate = async (projectId?: string, tags?: string[]) => {
    if (!duplicateInfo) return;

    const success = await associateToDuplicate(duplicateInfo.id, projectId, tags);
    if (success) {
      toast({
        title: "Documento associado",
        description: "O documento foi associado com sucesso ao novo projeto/tags.",
      });
      clearDuplicate();
      onIngestionComplete(duplicateInfo.id);
    } else {
      toast({
        title: "Erro na associação",
        description: "Não foi possível associar o documento.",
        variant: "destructive",
      });
    }
  };

  const handleProceedAnyway = async () => {
    if (!selectedFile) return;

    const defaultInstruction = "Processar e indexar documento na base de conhecimento";
    
    const analysisId = await uploadFile(selectedFile, defaultInstruction, {
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      tags: selectedTags,
      allowDuplicate: true,
      isIngestion: true,
    });
    
    if (analysisId) {
      onIngestionComplete(analysisId);
      clearDuplicate();
      // Reset form
      setSelectedFile(null);
      setSelectedProject(null);
      setSelectedTags([]);
      toast({
        title: "Documento ingerido",
        description: "O documento foi adicionado à base de conhecimento.",
      });
    }
  };

  const canStartIngestion = selectedFile && !isUploading;

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Ingestão de Documentos</h2>
          </div>
          <p className="text-muted-foreground">
            Adicione documentos à sua base de conhecimento para análises futuras
          </p>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Documento Único</TabsTrigger>
            <TabsTrigger value="batch">Ingestão em Lote</TabsTrigger>
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
                <h3 className="text-card-title">Organização dos Documentos</h3>
                
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

              <button
                type="submit"
                disabled={!canStartIngestion}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Ingerindo Documento...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Ingerir Documento</span>
                  </>
                )}
              </button>
            </form>
          </TabsContent>
          
          <TabsContent value="batch" className="mt-6">
            <BatchUploadForm onBatchStart={handleBatchComplete} />
          </TabsContent>
        </Tabs>
      </div>

      <DuplicateDocumentDialog
        isOpen={!!duplicateInfo}
        onClose={clearDuplicate}
        duplicateInfo={duplicateInfo}
        fileName={selectedFile?.name || ''}
        onAssociate={handleAssociateDuplicate}
        onProceedAnyway={handleProceedAnyway}
      />
    </>
  );
};
