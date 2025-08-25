
import React from 'react';
import { AlertTriangle, FileText, Folder, Tag } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { Project } from '@/hooks/useProjects';

interface DuplicateInfo {
  id: string;
  file_name: string;
  created_at: string;
  project_name?: string;
}

interface DuplicateDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateInfo: DuplicateInfo | null;
  fileName: string;
  onAssociate: (projectId?: string, tags?: string[]) => void;
  onProceedAnyway: () => void;
}

export const DuplicateDocumentDialog: React.FC<DuplicateDocumentDialogProps> = ({
  isOpen,
  onClose,
  duplicateInfo,
  fileName,
  onAssociate,
  onProceedAnyway
}) => {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  const handleAssociate = () => {
    onAssociate(selectedProject?.id, selectedTags);
    onClose();
  };

  if (!duplicateInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Documento Duplicado Detectado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>Arquivo já existe na biblioteca</AlertTitle>
            <AlertDescription>
              O arquivo "{fileName}" já foi processado anteriormente como "{duplicateInfo.file_name}" em {new Date(duplicateInfo.created_at).toLocaleDateString()}.
            </AlertDescription>
          </Alert>

          {duplicateInfo.project_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Folder className="h-4 w-4" />
              <span>Projeto atual: {duplicateInfo.project_name}</span>
            </div>
          )}

          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium">Associar a novo projeto/tags (opcional)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Projeto</label>
                <ProjectSelector
                  value={selectedProject}
                  onChange={setSelectedProject}
                  placeholder="Selecionar projeto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <TagInput
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Adicionar tags..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleAssociate}
              className="flex-1"
              disabled={!selectedProject && selectedTags.length === 0}
            >
              <Tag className="h-4 w-4 mr-2" />
              Associar
            </Button>
            <Button variant="destructive" onClick={onProceedAnyway} className="flex-1">
              Processar Mesmo Assim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
