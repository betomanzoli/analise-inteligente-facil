
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { AnalysisForm } from '@/components/AnalysisForm';
import { AnalysisResult } from '@/components/AnalysisResult';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const { toast } = useToast();

  const handleAnalysisStart = async (file: File, instruction: string) => {
    setIsLoading(true);
    setCurrentFileName(file.name);
    setAnalysisResult(null);
    
    try {
      // Simular chamada para o webhook do n8n
      // Em produção, aqui você faria a chamada real para o webhook
      console.log('Iniciando análise:', { fileName: file.name, instruction });
      
      // Simulação de delay para demonstração
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Resultado simulado
      const mockResult = `RELATÓRIO DE ANÁLISE - ${file.name}
═══════════════════════════════════════════════════

INSTRUÇÃO RECEBIDA:
${instruction}

RESUMO EXECUTIVO:
Este documento foi processado com sucesso pela nossa IA. 

PRINCIPAIS INSIGHTS:
• Documento analisado com ${Math.floor(Math.random() * 50 + 10)} páginas
• Identificados ${Math.floor(Math.random() * 20 + 5)} pontos principais
• Nível de complexidade: ${['Baixo', 'Médio', 'Alto'][Math.floor(Math.random() * 3)]}

RECOMENDAÇÕES:
1. Revisar as seções destacadas para melhor compreensão
2. Implementar as sugestões identificadas no documento
3. Acompanhar os próximos passos recomendados

CONCLUSÃO:
A análise foi concluída com sucesso. Os insights gerados podem ser utilizados para tomada de decisões estratégicas.

═══════════════════════════════════════════════════
Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`;

      setAnalysisResult(mockResult);
      
      toast({
        title: "Análise concluída!",
        description: "Seu documento foi analisado com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro ao processar seu documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Formulário de análise */}
          <section className="bg-surface-elevated rounded-2xl p-8 shadow-medium">
            <AnalysisForm
              onAnalysisStart={handleAnalysisStart}
              isLoading={isLoading}
            />
          </section>

          {/* Área de resultados */}
          <section>
            <AnalysisResult
              result={analysisResult}
              isLoading={isLoading}
              fileName={currentFileName}
            />
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-surface-subtle">
        <div className="container mx-auto px-6 py-8 text-center text-subtle">
          <p>© 2024 Plataforma de Análise Inteligente • Desenvolvido com ❤️ e IA</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
