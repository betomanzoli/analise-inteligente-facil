import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, FileText, MessageSquare } from 'lucide-react';
import NotebookManager from '@/components/admin/NotebookManager';
import TemplateManager from '@/components/admin/TemplateManager';
import PromptManager from '@/components/admin/PromptManager';

const Admin = () => {
  const { user } = useAuth();

  // Verificar se é admin (por enquanto, apenas verificar se está logado)
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Administração do Sistema</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie notebooks, templates e prompts para automação NotebookLM
          </p>
          <Badge variant="outline" className="mt-2">
            Admin: {user.email}
          </Badge>
        </div>

        {/* Warning Banner */}
        <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Database className="h-5 w-5" />
              Área Administrativa - Configuração Crítica
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              <strong>ATENÇÃO:</strong> Esta é a área de configuração do sistema. Alterações aqui afetam 
              diretamente o funcionamento da plataforma de automação NotebookLM. Certifique-se de que:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Os URLs dos notebooks estejam corretos e acessíveis</li>
                <li>Os templates sigam a estrutura recomendada</li>
                <li>Os prompts sejam testados antes de ativar</li>
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Admin Tabs */}
        <Tabs defaultValue="notebooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notebooks" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Notebooks
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notebooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Notebooks NotebookLM</CardTitle>
                <CardDescription>
                  Configure os URLs dos seus notebooks NotebookLM e teste a conectividade.
                  Estes notebooks serão utilizados como base de conhecimento para as análises.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotebookManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Templates</CardTitle>
                <CardDescription>
                  Upload e configure templates para geração de documentos finais. 
                  Formatos recomendados: DOCX (para edição), JSON (estruturado), HTML (web).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Prompts Especializados</CardTitle>
                <CardDescription>
                  Configure prompts específicos para diferentes tipos de análise farmacêutica.
                  Estes prompts direcionam a IA para gerar insights mais precisos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;