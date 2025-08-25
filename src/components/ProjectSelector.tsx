
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useProjects, useCreateProject, Project } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProjectSelectorProps {
  value?: Project | null;
  onChange: (project: Project | null) => void;
  placeholder?: string;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  value,
  onChange,
  placeholder = "Selecionar projeto..."
}) => {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const { data: projects = [] } = useProjects();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { toast } = useToast();

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    createProject(
      { 
        name: newProjectName.trim(), 
        description: newProjectDescription.trim() || undefined 
      },
      {
        onSuccess: (newProject) => {
          onChange(newProject);
          setNewProjectName('');
          setNewProjectDescription('');
          setCreateDialogOpen(false);
          toast({
            title: "Projeto criado",
            description: `O projeto "${newProject.name}" foi criado com sucesso.`
          });
        },
        onError: (error) => {
          toast({
            title: "Erro ao criar projeto",
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? value.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar projeto..." />
            <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${!value ? "opacity-100" : "opacity-0"}`}
                />
                Nenhum projeto
              </CommandItem>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    onChange(project);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value?.id === project.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {project.name}
                </CommandItem>
              ))}
              <CommandItem
                onSelect={() => {
                  setCreateDialogOpen(true);
                  setOpen(false);
                }}
                className="text-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar novo projeto
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Nome do Projeto *</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ex: Pesquisa de Estabilidade da Curcumina"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Descrição (opcional)</Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Descreva brevemente o objetivo do projeto..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                Criar Projeto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
