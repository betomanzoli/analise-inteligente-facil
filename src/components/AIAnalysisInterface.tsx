
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Search } from 'lucide-react';
import { useSemanticAnalysis } from '@/hooks/useSemanticAnalysis';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysisInterfaceProps {
  onAnalysisStart: (analysisId: string) => void;
}

export const AIAnalysisInterface: React.FC<AIAnalysisInterfaceProps> = ({
  onAnalysisStart
}) => {
  const [query, setQuery] = useState('');
  const { performAnalysis, isAnalyzing, error } = useSemanticAnalysis();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Consulta necessária",
        description: "Por favor, descreva sua consulta para análise.",
        variant: "destructive",
      });
      return;
    }

    const analysisId = await performAnalysis(query);
    
    if (analysisId) {
      onAnalysisStart(analysisId);
      setQuery('');
    }
  };

  const canStartAnalysis = query.trim() && !isAnalyzing;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-card-title flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Análise IA com Master Agent v6.0
        </h3>
        <p className="text-subtle">
          Faça perguntas sobre seus documentos. O Master Agent v6.0 irá buscar e analisar informações relevantes usando IA avançada.
        </p>
        
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Exemplo: Faça um resumo dos principais riscos mencionados nos contratos. Quais são as cláusulas mais importantes que devo considerar?"
          className="min-h-[120px] resize-none text-base"
          disabled={isAnalyzing}
        />
        
        <p className="text-xs text-subtle">
          Seja específico sobre que tipo de análise ou informação você precisa. O sistema irá buscar nos documentos da sua base de conhecimento.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canStartAnalysis}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analisando com IA...</span>
          </>
        ) : (
          <>
            <Search className="h-5 w-5" />
            <span>Analisar com Master Agent v6.0</span>
          </>
        )}
      </button>
    </form>
  );
};
