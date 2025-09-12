import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit, Copy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalysisPrompts, useCreateAnalysisPrompt, useUpdateAnalysisPrompt, useDeleteAnalysisPrompt, AnalysisPrompt } from '@/hooks/useAnalysisPrompts';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const PromptManager = () => {
  const { data: prompts = [], isLoading } = useAnalysisPrompts();
  const createPrompt = useCreateAnalysisPrompt();
  const updatePrompt = useUpdateAnalysisPrompt();
  const deletePrompt = useDeleteAnalysisPrompt();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AnalysisPrompt | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    prompt_text: '',
    description: '',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      prompt_text: '',
      description: '',
      status: 'active'
    });
  };

  const handleCreate = async () => {
    try {
      await createPrompt.mutateAsync(formData);
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: 'Prompt criado',
        description: 'Prompt especializado adicionado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar prompt',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;
    
    try {
      await updatePrompt.mutateAsync({
        id: editingPrompt.id,
        updates: formData
      });
      setEditingPrompt(null);
      resetForm();
      toast({
        title: 'Prompt atualizado',
        description: 'Alterações salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar prompt',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletePromptId) return;
    
    try {
      await deletePrompt.mutateAsync(deletePromptId);
      setDeletePromptId(null);
      toast({
        title: 'Prompt excluído',
        description: 'Prompt removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir prompt',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast({
      title: 'Prompt copiado',
      description: 'Texto do prompt copiado para a área de transferência.',
    });
  };

  const openEditDialog = (prompt: AnalysisPrompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      category: prompt.category,
      prompt_text: prompt.prompt_text,
      description: prompt.description || '',
      status: prompt.status
    });
  };

  // Prompts iniciais baseados nos notebooks fornecidos
  const suggestedPrompts = [
    {
      category: 'regulatory',
      name: 'Análise de Compliance Regulatório',
      prompt_text: 'Analise o documento fornecido quanto aos aspectos regulatórios farmacêuticos. Identifique:\n\n1. Requisitos regulatórios aplicáveis\n2. Pontos de conformidade e não-conformidade\n3. Ações corretivas necessárias\n4. Riscos regulatórios identificados\n5. Recomendações para adequação à legislação\n\nBase sua análise nas normas da ANVISA e regulamentações internacionais relevantes.',
      description: 'Para análise de conformidade com regulamentações farmacêuticas'
    },
    {
      category: 'technical',
      name: 'Avaliação Técnica de Formulação',
      prompt_text: 'Realize uma avaliação técnica completa da formulação apresentada. Considere:\n\n1. Compatibilidade entre componentes\n2. Estabilidade físico-química\n3. Viabilidade técnica da produção\n4. Otimizações sugeridas\n5. Controles de qualidade necessários\n6. Aspectos de bioequivalência/biodisponibilidade\n\nForneça recomendações técnicas fundamentadas.',
      description: 'Para análise técnica de formulações farmacêuticas'
    },
    {
      category: 'support',
      name: 'Análise Geral de Suporte',
      prompt_text: 'Forneça uma análise abrangente do documento, incluindo:\n\n1. Resumo executivo dos pontos principais\n2. Aspectos técnicos relevantes\n3. Considerações regulatórias básicas\n4. Oportunidades de melhoria\n5. Próximos passos sugeridos\n\nMantenha uma abordagem didática e prática.',
      description: 'Para análises gerais e suporte técnico básico'
    }
  ];

  const promptCategories = [
    { value: 'regulatory', label: 'Regulatório' },
    { value: 'technical', label: 'Técnico' },
    { value: 'support', label: 'Suporte' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'formulation', label: 'Formulação' },
    { value: 'validation', label: 'Validação' },
  ];

  const addSuggestedPrompt = (suggested: any) => {
    setFormData({
      name: suggested.name,
      category: suggested.category,
      prompt_text: suggested.prompt_text,
      description: suggested.description,
      status: 'active'
    });
    setIsCreateOpen(true);
  };

  if (isLoading) {
    return <div>Carregando prompts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Suggested Prompts */}
      {prompts.length === 0 && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 text-base">
              Prompts Sugeridos para Iniciar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedPrompts.map((suggested, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded border">
                <div>
                  <p className="font-medium">{suggested.name}</p>
                  <p className="text-sm text-muted-foreground">{suggested.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addSuggestedPrompt(suggested)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Usar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Prompts Especializados ({prompts.length})</h3>
          <p className="text-sm text-muted-foreground">
            Prompts otimizados para diferentes tipos de análise farmacêutica
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Prompt Especializado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Prompt</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Análise de Compliance ANVISA"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {promptCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="prompt_text">Texto do Prompt</Label>
                <Textarea
                  id="prompt_text"
                  value={formData.prompt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                  placeholder="Digite o prompt detalhado que será usado pela IA..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva quando e como usar este prompt..."
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createPrompt.isPending}>
                  {createPrompt.isPending ? 'Criando...' : 'Criar Prompt'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum prompt especializado configurado ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Crie prompts para direcionar as análises de IA.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {prompt.name}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {promptCategories.find(cat => cat.value === prompt.category)?.label || prompt.category}
                    </Badge>
                    <Badge variant={prompt.status === 'active' ? 'default' : 'secondary'}>
                      {prompt.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {prompt.usage_count > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {prompt.usage_count} usos
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(prompt.prompt_text)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(prompt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletePromptId(prompt.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {prompt.description || 'Sem descrição'}
                </p>
                <div className="bg-muted p-3 rounded font-mono text-xs">
                  {prompt.prompt_text.length > 200 
                    ? `${prompt.prompt_text.substring(0, 200)}...`
                    : prompt.prompt_text
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome do Prompt</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promptCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-prompt_text">Texto do Prompt</Label>
              <Textarea
                id="edit-prompt_text"
                value={formData.prompt_text}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updatePrompt.isPending}>
                {updatePrompt.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePromptId} onOpenChange={(open) => !open && setDeletePromptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O prompt será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletePrompt.isPending}>
              {deletePrompt.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromptManager;