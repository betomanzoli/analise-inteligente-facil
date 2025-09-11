import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  FileCheck,
  Clock
} from 'lucide-react';

interface SmartDocumentUploaderProps {
  onFileSelect: (file: File, detectedType: string) => void;
  isProcessing?: boolean;
  progress?: number;
}

const SmartDocumentUploader: React.FC<SmartDocumentUploaderProps> = ({
  onFileSelect,
  isProcessing = false,
  progress = 0
}) => {
  const [detectedType, setDetectedType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const detectDocumentType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Detect document type based on content patterns
    if (fileName.includes('bula') || fileName.includes('rotulo')) {
      return 'regulatory-label';
    } else if (fileName.includes('anvisa') || fileName.includes('fda') || fileName.includes('ema')) {
      return 'regulatory-guideline';
    } else if (fileName.includes('formulacao') || fileName.includes('formula')) {
      return 'formulation';
    } else if (fileName.includes('custo') || fileName.includes('preco')) {
      return 'costing';
    } else if (fileName.includes('literatura') || fileName.includes('artigo')) {
      return 'literature';
    } else if (fileType.includes('pdf')) {
      return 'technical-document';
    } else if (fileType.includes('image')) {
      return 'image-analysis';
    } else {
      return 'general-document';
    }
  };

  const getDocumentTypeInfo = (type: string) => {
    const types: Record<string, { label: string; description: string; icon: any; color: string }> = {
      'regulatory-label': {
        label: 'Bula/Rótulo',
        description: 'Análise de compliance regulatório',
        icon: FileCheck,
        color: 'text-blue-600'
      },
      'regulatory-guideline': {
        label: 'Guideline Regulatório',
        description: 'Interpretação de diretrizes ANVISA/FDA',
        icon: FileText,
        color: 'text-green-600'
      },
      'formulation': {
        label: 'Formulação',
        description: 'Otimização de fórmula farmacêutica',
        icon: Sparkles,
        color: 'text-purple-600'
      },
      'costing': {
        label: 'Análise de Custos',
        description: 'Precificação e margem de produto',
        icon: CheckCircle,
        color: 'text-orange-600'
      },
      'literature': {
        label: 'Literatura Técnica',
        description: 'Extração de insights científicos',
        icon: FileText,
        color: 'text-indigo-600'
      },
      'image-analysis': {
        label: 'Análise de Imagem',
        description: 'OCR e interpretação visual',
        icon: Image,
        color: 'text-pink-600'
      },
      'technical-document': {
        label: 'Documento Técnico',
        description: 'Análise geral especializada',
        icon: FileText,
        color: 'text-gray-600'
      },
      'general-document': {
        label: 'Documento Geral',
        description: 'Processamento inteligente',
        icon: Upload,
        color: 'text-gray-500'
      }
    };
    
    return types[type] || types['general-document'];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const type = detectDocumentType(file);
      setSelectedFile(file);
      setDetectedType(type);
      setDragActive(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const handleProcessDocument = () => {
    if (selectedFile && detectedType) {
      onFileSelect(selectedFile, detectedType);
    }
  };

  if (isProcessing) {
    return (
      <Card className="border-2 border-primary/20 bg-surface-elevated">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full animate-ping" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Processando Documento Farmacêutico
              </h3>
              <p className="text-sm text-muted-foreground">
                Análise especializada em andamento...
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Estimativa: 2-3 minutos para análise completa
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedFile && detectedType) {
    const typeInfo = getDocumentTypeInfo(detectedType);
    const IconComponent = typeInfo.icon;

    return (
      <Card className="border-2 border-primary/20 bg-surface-elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconComponent className={`h-8 w-8 ${typeInfo.color}`} />
            <div>
              <CardTitle className="text-foreground">Documento Detectado</CardTitle>
              <CardDescription>
                Tipo identificado automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface-subtle rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={typeInfo.color}>
              {typeInfo.label}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Análise Recomendada</p>
                <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedFile(null);
                setDetectedType('');
              }}
              className="flex-1"
            >
              Escolher Outro
            </Button>
            <Button 
              onClick={handleProcessDocument}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Iniciar Análise
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
      isDragActive || dragActive 
        ? 'border-primary bg-primary/5' 
        : 'border-border hover:border-primary/50 hover:bg-surface-elevated'
    }`}>
      <div {...getRootProps()} className="p-8">
        <input {...getInputProps()} />
        <CardContent className="text-center space-y-6 p-0">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Upload className={`h-12 w-12 transition-colors ${
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              }`} />
              {isDragActive && (
                <div className="absolute -inset-2 border-2 border-primary rounded-full animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isDragActive 
                ? 'Solte o documento aqui' 
                : 'Upload de Documento Farmacêutico'
              }
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Arraste e solte ou clique para selecionar. Suportamos PDFs, imagens e documentos Word.
              <br />
              <span className="font-medium">Detecção automática do tipo de análise recomendada.</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="text-xs">PDF</Badge>
            <Badge variant="outline" className="text-xs">Imagens</Badge>
            <Badge variant="outline" className="text-xs">Word</Badge>
            <Badge variant="outline" className="text-xs">Até 50MB</Badge>
          </div>

          {!isDragActive && (
            <Button variant="outline" className="mx-auto">
              Selecionar Arquivo
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default SmartDocumentUploader;