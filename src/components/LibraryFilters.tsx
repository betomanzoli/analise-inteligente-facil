
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { LibraryFilters as Filters } from '@/hooks/useKnowledgeLibrary';
import { Project } from '@/hooks/useProjects';

interface LibraryFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setSelectedProject(null);
    setSelectedTags([]);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documentos..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Status Filter */}
      <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="completed">Concluídos</SelectItem>
          <SelectItem value="processing">Processando</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="error">Com Erro</SelectItem>
        </SelectContent>
      </Select>

      {/* Advanced Filters */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avançados</h4>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Projeto</label>
            <ProjectSelector
              value={selectedProject}
              onChange={(project) => {
                setSelectedProject(project);
                updateFilter('projectId', project?.id);
              }}
              placeholder="Filtrar por projeto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <TagInput
              value={selectedTags}
              onChange={(tags) => {
                setSelectedTags(tags);
                updateFilter('tagId', tags[0]); // For now, support single tag filter
              }}
              placeholder="Filtrar por tags..."
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
