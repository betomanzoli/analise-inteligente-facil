import React, { useState } from 'react';
import { Copy, Download, MessageSquare, ExternalLink, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ViabilityResult, ViabilityFormData } from './types';
import { PRODUCT_TYPE_OPTIONS, DEVELOPMENT_COST_RANGES, FORM_LABELS } from './constants';

interface ViabilityResultsProps {
  result: ViabilityResult;
  formData: ViabilityFormData;
  onNewAnalysis: () => void;
}

export function ViabilityResults({ result, formData, onNewAnalysis }: ViabilityResultsProps) {
  const { toast } = useToast();
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const copyToClipboard = async () => {
    const text = `Análise de Viabilidade - ${result.level} (${result.percentage}%)\n\n${result.summary}\n\nRecomendações:\n${result.recommendations.map(r => `• ${r}`).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Resultado copiado!",
        description: "O resultado foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o resultado.",
        variant: "destructive",
      });
    }
  };

  const downloadAnalysis = () => {
    const content = `ANÁLISE DE VIABILIDADE - RELATÓRIO DETALHADO
===============================================

RESULTADO GERAL
• Nível de Viabilidade: ${result.level}
• Pontuação: ${result.percentage}%

RESUMO EXECUTIVO
${result.summary}

DADOS DE ENTRADA
• ${FORM_LABELS.productType}: ${PRODUCT_TYPE_OPTIONS.find(opt => opt.value === formData.productType)?.label || formData.productType}
• ${FORM_LABELS.developmentCost}: ${DEVELOPMENT_COST_RANGES.find(opt => opt.value === formData.developmentCost)?.label || formData.developmentCost}
• ${FORM_LABELS.timeToMarket}: ${formData.timeToMarket}
• Complexidade Regulatória: ${formData.regulatoryComplexity}
• Nível de Competição: ${formData.competitionLevel}
• Tamanho do Mercado: ${formData.marketSize}

SCORES DETALHADOS
• Produto: ${result.scores.product}%
• Custos: ${result.scores.cost}%
• Tempo: ${result.scores.time}%
• Regulatório: ${result.scores.regulatory}%
• Competição: ${result.scores.competition}%
• Mercado: ${result.scores.market}%

RECOMENDAÇÕES
${result.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

IMPORTANTE
Esta análise é uma estimativa baseada em dados informados e deve ser complementada com consultoria especializada.

Gerado em: ${new Date().toLocaleString('pt-BR')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-viabilidade-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado!",
      description: "O relatório está sendo baixado.",
    });
  };

  const generateWhatsAppMessage = () => {
    const productType = PRODUCT_TYPE_OPTIONS.find(opt => opt.value === formData.productType)?.label || 'Produto';
    const costRange = DEVELOPMENT_COST_RANGES.find(opt => opt.value === formData.developmentCost)?.label || 'Não informado';
    
    return `Olá! Usei a Calculadora de Viabilidade da plataforma e obtive *${result.level}* (${result.percentage}%).

📊 *Detalhes do meu projeto:*
• Produto: ${productType}
• Investimento: ${costRange}
• Tempo estimado: ${formData.timeToMarket}

Gostaria de uma análise mais detalhada e personalizada para o meu projeto.`;
  };

  const handleWhatsAppContact = () => {
    setShowWhatsAppDialog(true);
  };

  const confirmWhatsAppContact = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppDialog(false);
    
    toast({
      title: "Redirecionando para WhatsApp",
      description: "Você será redirecionado para conversar com nosso especialista.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resultado Principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">{result.icon}</div>
            <div>
              <CardTitle className="text-2xl">Viabilidade {result.level}</CardTitle>
              <CardDescription className="text-lg">{result.percentage}% de viabilidade</CardDescription>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <Progress value={result.percentage} className="h-3 mb-2" />
            <Badge variant="secondary" className={`${result.color} text-sm`}>
              {result.level}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-muted-foreground leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAnalysis}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" onClick={handleWhatsAppContact}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Falar com Especialista
            </Button>
            <Button variant="ghost" size="sm" onClick={onNewAnalysis}>
              Nova Análise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scores Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Detalhada por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'product', label: 'Tipo de Produto', score: result.scores.product },
              { key: 'cost', label: 'Custos de Desenvolvimento', score: result.scores.cost },
              { key: 'time', label: 'Tempo até o Mercado', score: result.scores.time },
              { key: 'regulatory', label: 'Complexidade Regulatória', score: result.scores.regulatory },
              { key: 'competition', label: 'Nível de Competição', score: result.scores.competition },
              { key: 'market', label: 'Tamanho do Mercado', score: result.scores.market },
            ].map(({ key, label, score }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium flex-1">{label}</span>
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <Progress value={score} className="flex-1" />
                  <span className="text-sm font-medium w-12 text-right">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Estratégicas</CardTitle>
          <CardDescription>
            Insights baseados na análise dos fatores de viabilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recommendation}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação WhatsApp */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Falar com Especialista</DialogTitle>
            <DialogDescription>
              Esta mensagem será enviada via WhatsApp para nosso especialista em Life Sciences:
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {generateWhatsAppMessage()}
            </pre>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmWhatsAppContact}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Enviar via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}