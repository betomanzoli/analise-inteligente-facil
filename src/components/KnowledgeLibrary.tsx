
import React, { useState } from 'react';
import { FileText, Eye, Download, Trash2, Calendar, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LibraryFilters } from './LibraryFilters';
import { useKnowledgeLibrary, useKnowledgeStats, LibraryFilters as Filters } from '@/hooks/useKnowledgeLibrary';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeLibraryProps {
  onViewDocument: (documentId: string) => void;
}

export const KnowledgeLibrary: React.FC<KnowledgeLibraryProps> = ({
  onViewDocument
}) => {
  const [filters, setFilters] = useState<Filters>({});
  const { data: documents = [], isLoading } = useKnowledgeLibrary(filters);
  const { data: stats } = useKnowledgeStats();
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'secondary', 
      completed: 'default',
      error: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluído', 
      error: 'Erro'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Conhecimento</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e explore seus documentos analisados
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.processing}</p>
                  <p className="text-xs text-muted-foreground">Processando</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-xs text-muted-foreground">Armazenado</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <LibraryFilters filters={filters} onFiltersChange={setFilters} />
      </Card>

      {/* Document Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : documents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0 
                ? 'Tente ajustar os filtros para encontrar documentos.'
                : 'Faça upload de seus primeiros documentos para começar.'
              }
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    {getStatusIcon(doc.status)}
                    <h3 className="font-medium truncate" title={doc.file_name}>
                      {doc.file_name}
                    </h3>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(doc.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                  <span className="mx-2">•</span>
                  {formatFileSize(doc.file_size)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {doc.instruction}
                </p>
                
                {/* Projects and Tags */}
                <div className="space-y-2 mb-4">
                  {doc.projects && doc.projects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.projects.map(project => (
                        <Badge key={project.id} variant="outline" className="text-xs">
                          {project.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onViewDocument(doc.id)}
                    disabled={doc.status !== 'completed'}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  
                  {doc.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Exportar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
