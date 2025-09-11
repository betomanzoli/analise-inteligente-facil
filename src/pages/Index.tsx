
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import SmartDocumentUploader from '@/components/SmartDocumentUploader';
import SpecializedAnalysisSelector from '@/components/SpecializedAnalysisSelector';
import ProfessionalReportViewer from '@/components/ProfessionalReportViewer';
import { AnalysisHistorySidebar } from '@/components/AnalysisHistorySidebar';
import { EnhancedAnalysisResult } from '@/components/EnhancedAnalysisResult';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useStaleAnalysisCleanup } from '@/hooks/useStaleAnalysisCleanup';
import { Navigate } from 'react-router-dom';
import { Loader2, Sparkles, Target, Calculator, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { user, loading } = useAuth();
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'select' | 'processing' | 'results'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedType, setDetectedType] = useState<string>('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const { analyses, refreshAnalyses } = useAnalysisHistory();
  
  // Clean up stale analyses on component mount
  useStaleAnalysisCleanup();

  useEffect(() => {
    if (user) {
      refreshAnalyses();
    }
  }, [user, refreshAnalyses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileSelect = (file: File, detectedType: string) => {
    setSelectedFile(file);
    setDetectedType(detectedType);
    setCurrentStep('select');
  };

  const handleAnalysisSelect = async (analysisType: string) => {
    setSelectedAnalysisType(analysisType);
    setCurrentStep('processing');
    setProcessingProgress(0);
    
    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    try {
      // Here would be the actual API call to process the document
      // For now, simulate the processing
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // Simulate completion
      setTimeout(() => {
        setCurrentStep('results');
        refreshAnalyses();
      }, 1000);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      clearInterval(progressInterval);
      setCurrentStep('upload');
    }
  };

  const handleNewAnalysis = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setDetectedType('');
    setSelectedAnalysisType('');
    setProcessingProgress(0);
  };

  const handleAnalysisStart = (analysisId: string | string[]) => {
    const ids = Array.isArray(analysisId) ? analysisId : [analysisId];
    setSelectedAnalysisIds(ids);
    refreshAnalyses();
  };

  const selectedAnalyses = analyses.filter(analysis => 
    selectedAnalysisIds.includes(analysis.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <AnalysisHistorySidebar
          analyses={analyses}
          selectedAnalysisIds={selectedAnalysisIds}
          onAnalysisSelect={setSelectedAnalysisIds}
          onRefresh={refreshAnalyses}
        />
        
        <main className="flex-1 p-6">
          {selectedAnalyses.length > 0 ? (
            <div className="space-y-6">
              {selectedAnalyses.map((analysis) => (
                <EnhancedAnalysisResult
                  key={analysis.id}
                  analysis={analysis}
                  onRefresh={refreshAnalyses}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {currentStep === 'upload' && (
                <div className="space-y-8">
                  {/* Hero Section */}
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="relative">
                        <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                          <Sparkles className="h-12 w-12 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-accent rounded-full flex items-center justify-center animate-pulse">
                          <span className="text-xs font-bold text-accent-foreground">IA</span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                          Análises Farmacêuticas Especializadas
                        </h1>
                        <p className="text-xl text-muted-foreground">
                          Em minutos, não semanas
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      Upload qualquer documento regulatório ou técnico e receba 
                      <span className="font-semibold text-foreground"> insights profissionais automáticos</span>. 
                      Nossa IA especializada analisa documentos farmacêuticos complexos e entrega 
                      relatórios estruturados para tomada de decisão.
                    </p>

                    {/* Value Props */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      <Card className="bg-surface-elevated border-primary/20">
                        <CardContent className="p-4 text-center">
                          <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="font-medium text-foreground">70-90% Mais Rápido</p>
                          <p className="text-sm text-muted-foreground">que consultoria tradicional</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-surface-elevated border-accent/20">
                        <CardContent className="p-4 text-center">
                          <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
                          <p className="font-medium text-foreground">Compliance Verificado</p>
                          <p className="text-sm text-muted-foreground">normas ANVISA/FDA</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-surface-elevated border-primary/20">
                        <CardContent className="p-4 text-center">
                          <Calculator className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="font-medium text-foreground">ROI Automático</p>
                          <p className="text-sm text-muted-foreground">tracking de valor gerado</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-surface-elevated border-accent/20">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                          <p className="font-medium text-foreground">24/7 Disponível</p>
                          <p className="text-sm text-muted-foreground">insights em minutos</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Smart Upload */}
                  <SmartDocumentUploader onFileSelect={handleFileSelect} />

                  {/* Recent Analyses */}
                  {analyses.length > 0 && (
                    <Card className="bg-surface-elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Análises Recentes
                        </CardTitle>
                        <CardDescription>
                          Acesse rapidamente suas análises anteriores
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analyses.slice(0, 4).map((analysis) => (
                            <Card key={analysis.id} className="cursor-pointer hover:bg-surface-subtle transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{analysis.status}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="font-medium text-foreground truncate">
                                  {analysis.file_name || 'Análise sem nome'}
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full mt-2"
                                  onClick={() => setSelectedAnalysisIds([analysis.id])}
                                >
                                  Ver Resultados
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {currentStep === 'select' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handleNewAnalysis}>
                      ← Voltar
                    </Button>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Tipo de Análise Especializada
                      </h2>
                      <p className="text-muted-foreground">
                        Arquivo: {selectedFile?.name}
                      </p>
                    </div>
                  </div>
                  
                  <SpecializedAnalysisSelector 
                    detectedType={detectedType}
                    onAnalysisSelect={handleAnalysisSelect}
                  />
                </div>
              )}

              {currentStep === 'processing' && (
                <SmartDocumentUploader 
                  onFileSelect={() => {}}
                  isProcessing={true}
                  progress={processingProgress}
                />
              )}

              {currentStep === 'results' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                      Relatório de Análise Especializada
                    </h2>
                    <Button onClick={handleNewAnalysis}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Nova Análise
                    </Button>
                  </div>
                  
                  {/* Mock result data - replace with real analysis results */}
                  <ProfessionalReportViewer 
                    result={{
                      id: 'mock-001',
                      type: selectedAnalysisType,
                      title: `Análise ${selectedAnalysisType} - ${selectedFile?.name}`,
                      executiveSummary: {
                        verdict: 'Documento apresenta conformidade parcial com diretrizes regulatórias vigentes',
                        confidenceLevel: 'Alto',
                        keyInsights: [
                          'Identificadas 3 lacunas de compliance que requerem atenção',
                          'Formulação apresenta oportunidades de otimização de custos',
                          'Timeline estimado de 4-6 meses para regularização completa'
                        ]
                      },
                      detailedAnalysis: {
                        sections: [
                          {
                            title: 'Análise Regulatória',
                            content: 'Avaliação detalhada do documento em relação às diretrizes ANVISA.',
                            findings: [
                              'Conformidade com RDC 318/2019',
                              'Gap identificado na documentação de estabilidade',
                              'Rotulagem requer ajustes conforme RDC 71/2009'
                            ]
                          }
                        ]
                      },
                      recommendations: {
                        immediate: ['Revisar documentação de estabilidade', 'Adequar rotulagem'],
                        shortTerm: ['Realizar estudos complementares', 'Atualizar dossier regulatório'],
                        longTerm: ['Implementar sistema de farmacovigilância']
                      },
                      riskAssessment: {
                        high: ['Atraso na aprovação regulatória'],
                        medium: ['Necessidade de estudos adicionais'],
                        low: ['Ajustes menores na documentação']
                      },
                      roiMetrics: {
                        estimatedSavings: 'R$ 25.000',
                        timeReduction: '60%',
                        riskMitigation: 'Alto'
                      },
                      sources: ['Documento fornecido', 'Base regulatória ANVISA'],
                      generatedAt: new Date().toISOString()
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
