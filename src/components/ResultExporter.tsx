
import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ResultExporterProps {
  content: string;
  fileName: string;
}

export const ResultExporter: React.FC<ResultExporterProps> = ({ content, fileName }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportAsText = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${fileName}_analise.txt`);
  };

  const exportAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${fileName}_analise.md`);
  };

  const exportAsHTML = async () => {
    setIsExporting(true);
    try {
      // Convert markdown-like content to HTML
      const htmlContent = convertToHTML(content);
      const fullHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise - ${fileName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #2563eb; margin-top: 2em; margin-bottom: 0.5em; }
        h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5em; }
        p { margin-bottom: 1em; }
        strong { color: #1f2937; }
        ul, ol { margin-bottom: 1em; padding-left: 2em; }
        li { margin-bottom: 0.5em; }
        .highlight { background-color: #fef3c7; padding: 0.25em 0.5em; border-radius: 0.25em; }
    </style>
</head>
<body>
    <h1>Relatório de Análise</h1>
    <p><strong>Documento:</strong> ${fileName}</p>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    <hr>
    ${htmlContent}
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${fileName}_analise.html`);
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar como HTML.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const convertToHTML = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Paragraphs
      .split('\n\n')
      .map(para => para.trim() ? `<p>${para.replace(/\n/g, '<br>')}</p>` : '')
      .join('\n');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: `Arquivo ${filename} está sendo baixado.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="h-4 w-4 mr-2" />
          Texto (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsHTML}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          HTML (.html)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
