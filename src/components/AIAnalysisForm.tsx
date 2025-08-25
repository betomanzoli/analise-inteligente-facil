
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Zap, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIAnalysisFormProps {
  onAnalysisStart: (query: string) => void;
}

export const AIAnalysisForm: React.FC<AIAnalysisFormProps> = ({
  onAnalysisStart
}) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsAnalyzing(true);
    try {
      await onAnalysisStart(query.trim());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleQueries = [
    "Faça um resumo executivo dos documentos relacionados ao projeto X",
    "Quais são os principais riscos identificados nos documentos?",
    "Compare as metodologias apresentadas nos diferentes estudos",
    "Identifique oportunidades de melhoria nos processos documentados"
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Análise IA</h2>
        </div>
        <p className="text-muted-foreground">
          Faça perguntas inteligentes sobre sua base de conhecimento
        </p>
      </div>

      <Card className="border-gradient-to-r from-purple-200 to-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>O que você gostaria de saber?</span>
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              IA Avançada
            </Badge>
          </CardTitle>
          <CardDescription>
            Descreva que tipo de análise, resumo ou insights você precisa dos seus documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Exemplo: Faça um resumo executivo dos documentos do projeto X, identifique os pontos principais e forneça recomendações estratégicas..."
              className="min-h-[120px] resize-none text-base"
              disabled={isAnalyzing}
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-subtle">
                Seja específico sobre que tipo de análise você precisa
              </p>
              
              <Button
                type="submit"
                disabled={!query.trim() || isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Iniciar Análise IA
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Exemplos de Análises</span>
          </CardTitle>
          <CardDescription>
            Clique em um exemplo para usar como ponto de partida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {exampleQueries.map((example, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow border-dashed hover:border-solid hover:border-blue-300"
                onClick={() => handleExampleClick(example)}
              >
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    "{example}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
