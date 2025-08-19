
import React from 'react';
import { FileText, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResultProps {
  result: string | null;
  isLoading: boolean;
  fileName?: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isLoading,
  fileName
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        toast({
          title: "Copiado!",
          description: "O relatório foi copiado para a área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise_${fileName?.replace('.pdf', '') || 'documento'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: "O relatório está sendo baixado.",
      });
    }
  };

  if (!result && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-section-title flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span>Relatório de Análise</span>
        </h2>
        
        {result && (
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Copiar relatório"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Baixar relatório"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="result-card min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Analisando documento...</p>
              <p className="text-subtle">
                Nossa IA está processando seu arquivo e gerando insights personalizados.
              </p>
            </div>
          </div>
        ) : result ? (
          <div className="prose prose-gray max-w-none animate-fade-in">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {result}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Os resultados da análise aparecerão aqui...</p>
          </div>
        )}
      </div>
    </div>
  );
};
