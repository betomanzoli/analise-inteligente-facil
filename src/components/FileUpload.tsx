
import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  acceptedTypes?: string;
  maxSize?: number; // em MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  acceptedTypes = ".pdf",
  maxSize = 10
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Verificar tipo
    if (!file.type.includes('pdf')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos PDF.",
        variant: "destructive",
      });
      return false;
    }

    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter menos de ${maxSize}MB.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileChange(file);
      toast({
        title: "Arquivo carregado",
        description: `${file.name} foi carregado com sucesso.`,
      });
    }
  }, [onFileChange, maxSize, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-card-title mb-3">
        1. Anexe o Documento (.pdf)
      </label>
      
      {selectedFile ? (
        <div className="result-card animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-subtle">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Remover arquivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-area ${isDragActive ? 'upload-area-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            Arraste seu arquivo PDF aqui
          </h3>
          <p className="text-subtle mb-4">
            ou clique para selecionar um arquivo
          </p>
          <p className="text-xs text-muted-foreground">
            Máximo {maxSize}MB • Apenas arquivos PDF
          </p>
          
          <input
            id="file-input"
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
