
import React from 'react';
import { Brain, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      <div className="relative container mx-auto px-6 py-16 text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="relative">
            <Brain className="h-12 w-12 text-primary" />
            <Zap className="h-6 w-6 text-primary absolute -top-1 -right-1" />
          </div>
          <h1 className="text-hero bg-gradient-primary bg-clip-text text-transparent">
            Plataforma de Análise Inteligente
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Transforme seus documentos PDF em insights valiosos usando 
          <span className="font-medium text-foreground"> inteligência artificial avançada</span>. 
          Carregue, analise e obtenha relatórios detalhados em minutos.
        </p>
        
        <div className="flex items-center justify-center space-x-8 mt-8 text-subtle">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Análise Rápida</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>IA Avançada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Insights Personalizados</span>
          </div>
        </div>
      </div>
    </header>
  );
};
