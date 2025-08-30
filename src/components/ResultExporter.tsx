
import React from 'react';
import { Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AnalysisRecord } from '@/hooks/useAnalysisHistory';

interface ResultExporterProps {
  analysis: AnalysisRecord;
}

export const ResultExporter: React.FC<ResultExporterProps> = ({ analysis }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (analysis.result) {
      try {
        await navigator.clipboard.writeText(analysis.result);
        toast({
          title: "Copiado!",
          description: "O resultado foi copiado para a área de transferência.",
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
    if (analysis.result) {
      const blob = new Blob([analysis.result], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analise_${analysis.file_name?.replace('.pdf', '') || 'documento'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: "O resultado está sendo baixado.",
      });
    }
  };

  if (!analysis.result) return null;

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-1"
      >
        <Copy className="h-4 w-4" />
        Copiar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        Baixar
      </Button>
    </div>
  );
};
