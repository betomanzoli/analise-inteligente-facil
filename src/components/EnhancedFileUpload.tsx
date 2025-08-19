
import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFileUploadProps {
  onFileChange: (file: File | null) => void;
  acceptedTypes?: string;
  maxSize?: number;
  uploadProgress?: { percentage: number; stage: string } | null;
  isUploading?: boolean;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFileChange,
  acceptedTypes = ".pdf",
  maxSize = 25,
  uploadProgress,
  isUploading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!file.type.includes('pdf')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos PDF.",
        variant: "destructive",
      });
      return false;
    }

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
    }
  }, [onFileChange, maxSize, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, isUploading]);

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
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    if (isUploading) return;
    
    setSelectedFile(null);
    onFileChange(null);
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
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {uploadProgress?.percentage === 100 && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            {!isUploading && (
              <button
                onClick={removeFile}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Remover arquivo"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          {uploadProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-subtle">{uploadProgress.stage}</span>
                <span className="text-subtle">{uploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`upload-area ${isDragActive ? 'upload-area-active' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && document.getElementById('file-input')?.click()}
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
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
};
