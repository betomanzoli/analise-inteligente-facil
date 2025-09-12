import React, { useState } from 'react';
import { Plus, Trash2, TestTube, Edit, ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotebooks, useCreateNotebook, useUpdateNotebook, useDeleteNotebook, useTestNotebookConnectivity, Notebook } from '@/hooks/useNotebooks';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const NotebookManager = () => {
  const { data: notebooks = [], isLoading } = useNotebooks();
  const createNotebook = useCreateNotebook();
  const updateNotebook = useUpdateNotebook();
  const deleteNotebook = useDeleteNotebook();
  const testConnectivity = useTestNotebookConnectivity();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [deleteNotebookId, setDeleteNotebookId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'regulatory',
    priority: 3,
    description: '',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      category: 'regulatory',
      priority: 3,
      description: '',
      status: 'active'
    });
  };

  const handleCreate = async () => {
    try {
      await createNotebook.mutateAsync(formData);
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: 'Notebook criado',
        description: 'Notebook NotebookLM adicionado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar notebook',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingNotebook) return;
    
    try {
      await updateNotebook.mutateAsync({
        id: editingNotebook.id,
        updates: formData
      });
      setEditingNotebook(null);
      resetForm();
      toast({
        title: 'Notebook atualizado',
        description: 'Alterações salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar notebook',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteNotebookId) return;
    
    try {
      await deleteNotebook.mutateAsync(deleteNotebookId);
      setDeleteNotebookId(null);
      toast({
        title: 'Notebook excluído',
        description: 'Notebook removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir notebook',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await testConnectivity.mutateAsync(id);
      toast({
        title: result.connectivity_status === 'connected' ? 'Conexão bem-sucedida' : 'Falha na conexão',
        description: result.connectivity_status === 'connected' 
          ? 'Notebook acessível e funcionando.'
          : 'Verifique o URL e as permissões do notebook.',
        variant: result.connectivity_status === 'connected' ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível testar a conectividade.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (notebook: Notebook) => {
    setEditingNotebook(notebook);
    setFormData({
      name: notebook.name,
      url: notebook.url,
      category: notebook.category,
      priority: notebook.priority,
      description: notebook.description || '',
      status: notebook.status
    });
  };

  const getConnectivityIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      regulatory: 'Regulatório',
      technical: 'Técnico',
      support: 'Suporte'
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (isLoading) {
    return <div>Carregando notebooks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Notebooks Configurados ({notebooks.length})</h3>
          <p className="text-sm text-muted-foreground">
            URLs dos seus notebooks NotebookLM para automação
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Notebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Notebook NotebookLM</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Notebook Regulatório Principal"
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL do NotebookLM</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://notebooklm.google.com/notebook/..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regulatory">Regulatório</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridade (1-5)</Label>
                  <Select value={formData.priority.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Máxima</SelectItem>
                      <SelectItem value="4">4 - Alta</SelectItem>
                      <SelectItem value="3">3 - Média</SelectItem>
                      <SelectItem value="2">2 - Baixa</SelectItem>
                      <SelectItem value="1">1 - Mínima</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o conteúdo e uso deste notebook..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createNotebook.isPending}>
                  {createNotebook.isPending ? 'Criando...' : 'Criar Notebook'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notebooks Grid */}
      {notebooks.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nenhum notebook configurado ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Adicione seus notebooks NotebookLM para começar a automação.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notebooks.map((notebook) => (
            <Card key={notebook.id} className="relative">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {notebook.name}
                    {getConnectivityIcon(notebook.connectivity_status)}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {getCategoryLabel(notebook.category)}
                    </Badge>
                    <Badge variant="secondary">
                      Prioridade {notebook.priority}
                    </Badge>
                    <Badge variant={notebook.status === 'active' ? 'default' : 'secondary'}>
                      {notebook.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTest(notebook.id)}
                    disabled={testConnectivity.isPending}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(notebook)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(notebook.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteNotebookId(notebook.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {notebook.description || 'Sem descrição'}
                </p>
                <p className="text-xs text-muted-foreground">
                  URL: {notebook.url}
                </p>
                {notebook.last_tested_at && (
                  <p className="text-xs text-muted-foreground">
                    Último teste: {new Date(notebook.last_tested_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingNotebook} onOpenChange={(open) => !open && setEditingNotebook(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Notebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-url">URL do NotebookLM</Label>
              <Input
                id="edit-url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regulatory">Regulatório</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="support">Suporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-priority">Prioridade (1-5)</Label>
                <Select value={formData.priority.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Máxima</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="3">3 - Média</SelectItem>
                    <SelectItem value="2">2 - Baixa</SelectItem>
                    <SelectItem value="1">1 - Mínima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNotebook(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateNotebook.isPending}>
                {updateNotebook.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNotebookId} onOpenChange={(open) => !open && setDeleteNotebookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O notebook será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteNotebook.isPending}>
              {deleteNotebook.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotebookManager;