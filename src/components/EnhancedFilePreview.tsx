
import React from 'react';
import { FileText, Eye, Calendar, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  pages?: number;
}

interface EnhancedFilePreviewProps {
  file: File;
  metadata?: FileMetadata;
}

export const EnhancedFilePreview: React.FC<EnhancedFilePreviewProps> = ({ file, metadata }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeColor = (type: string) => {
    if (type.includes('pdf')) return 'bg-red-100 text-red-800';
    if (type.includes('doc')) return 'bg-blue-100 text-blue-800';
    if (type.includes('text')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed border-muted-foreground/25">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium truncate">{file.name}</h3>
            <Badge variant="secondary" className={getFileTypeColor(file.type)}>
              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <HardDrive className="h-3 w-3" />
              <span>{formatFileSize(file.size)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(file.lastModified)}</span>
            </div>
            
            {metadata?.pages && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{metadata.pages} páginas</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        Arquivo selecionado e pronto para análise
      </div>
    </div>
  );
};
