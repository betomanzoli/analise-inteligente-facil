
import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BatchFileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedTypes?: string;
  maxSize?: number;
  maxFiles?: number;
  isUploading?: boolean;
}

export const BatchFileUpload: React.FC<BatchFileUploadProps> = ({
  onFilesChange,
  acceptedTypes = ".pdf",
  maxSize = 25,
  maxFiles = 20,
  isUploading = false
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!file.type.includes('pdf')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: `${file.name}: Por favor, selecione apenas arquivos PDF.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `${file.name}: O arquivo deve ter menos de ${maxSize}MB.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFilesSelect = useCallback((newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const validFiles = filesArray.filter(validateFile);
    
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${maxFiles} arquivos permitido. ${totalFiles - maxFiles} arquivo(s) não foram adicionados.`,
        variant: "destructive",
      });
      
      const allowedNewFiles = validFiles.slice(0, maxFiles - selectedFiles.length);
      const updatedFiles = [...selectedFiles, ...allowedNewFiles];
      setSelectedFiles(updatedFiles);
      onFilesChange(updatedFiles);
      return;
    }

    // Check for duplicates
    const duplicateFiles: string[] = [];
    const uniqueFiles = validFiles.filter(file => {
      const isDuplicate = selectedFiles.some(existing => 
        existing.name === file.name && existing.size === file.size
      );
      if (isDuplicate) duplicateFiles.push(file.name);
      return !isDuplicate;
    });

    if (duplicateFiles.length > 0) {
      toast({
        title: "Arquivos duplicados",
        description: `Os seguintes arquivos já foram selecionados: ${duplicateFiles.join(', ')}`,
        variant: "destructive",
      });
    }

    const updatedFiles = [...selectedFiles, ...uniqueFiles];
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);

    if (uniqueFiles.length > 0) {
      toast({
        title: "Arquivos adicionados",
        description: `${uniqueFiles.length} arquivo(s) adicionado(s) com sucesso.`,
      });
    }
  }, [selectedFiles, onFilesChange, maxFiles, maxSize, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFilesSelect(files);
    }
  }, [handleFilesSelect, isUploading]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragActive(true);
    }
  }, [isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (isUploading) return;
    
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-card-title mb-3">
        1. Anexe os Documentos (.pdf)
      </label>
      
      {selectedFiles.length === 0 ? (
        <div
          className={`upload-area ${isDragActive ? 'upload-area-active' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && document.getElementById('batch-file-input')?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            Arraste múltiplos arquivos PDF aqui
          </h3>
          <p className="text-subtle mb-4">
            ou clique para selecionar vários arquivos
          </p>
          <p className="text-xs text-muted-foreground">
            Máximo {maxSize}MB por arquivo • Até {maxFiles} arquivos • Apenas PDFs
          </p>
          
          <input
            id="batch-file-input"
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
            multiple
            disabled={isUploading}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {selectedFiles.length} arquivo(s) selecionado(s)
            </p>
            {!isUploading && (
              <button
                onClick={() => document.getElementById('batch-file-input')?.click()}
                className="text-sm text-primary hover:underline"
              >
                + Adicionar mais arquivos
              </button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2 bg-muted/20 rounded-lg p-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-background rounded-lg p-3 border">
                <div className="flex items-center space-x-3">
                  <File className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                    title="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <input
            id="batch-file-input"
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
            multiple
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
};
