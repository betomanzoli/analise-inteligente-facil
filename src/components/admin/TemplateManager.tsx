import React, { useState } from 'react';
import { Upload, FileText, Trash2, Edit, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, Template } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const TemplateManager = () => {
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    file_type: 'docx',
    pricing: 0,
    status: 'active',
    version: '1.0'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      file_type: 'docx',
      pricing: 0,
      status: 'active',
      version: '1.0'
    });
  };

  const handleCreate = async () => {
    try {
      await createTemplate.mutateAsync({
        ...formData,
        file_path: `/templates/${formData.name.toLowerCase().replace(/\s+/g, '-')}.${formData.file_type}`,
      });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: 'Template criado',
        description: 'Template adicionado com sucesso. Faça o upload do arquivo.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar template',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;
    
    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        updates: formData
      });
      setEditingTemplate(null);
      resetForm();
      toast({
        title: 'Template atualizado',
        description: 'Alterações salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar template',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplateId) return;
    
    try {
      await deleteTemplate.mutateAsync(deleteTemplateId);
      setDeleteTemplateId(null);
      toast({
        title: 'Template excluído',
        description: 'Template removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir template',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      file_type: template.file_type,
      pricing: template.pricing || 0,
      status: template.status,
      version: template.version
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratuito';
    return `R$ ${price.toFixed(2)}`;
  };

  const templateCategories = [
    { value: 'regulatory', label: 'Regulatório' },
    { value: 'formulation', label: 'Formulação' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'validation', label: 'Validação' },
    { value: 'veterinary', label: 'Veterinário' },
    { value: 'supplements', label: 'Suplementos' },
  ];

  if (isLoading) {
    return <div>Carregando templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-base">
            <AlertCircle className="h-5 w-5" />
            Formatos de Template Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
          <p><strong>DOCX:</strong> Melhor para templates editáveis com formatação complexa (relatórios, pareceres)</p>
          <p><strong>JSON:</strong> Ideal para templates estruturados com dados dinâmicos (especificações, protocolos)</p>
          <p><strong>HTML:</strong> Perfeito para visualização web e emails automáticos</p>
          <p><strong>PDF:</strong> Para documentos finais não-editáveis (certificados, laudos)</p>
        </CardContent>
      </Card>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Templates Configurados ({templates.length})</h3>
          <p className="text-sm text-muted-foreground">
            Templates para geração automatizada de documentos farmacêuticos
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Upload className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório de Compliance ANVISA"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file_type">Formato</Label>
                  <Select value={formData.file_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, file_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docx">DOCX (Editável)</SelectItem>
                      <SelectItem value="json">JSON (Estruturado)</SelectItem>
                      <SelectItem value="html">HTML (Web)</SelectItem>
                      <SelectItem value="pdf">PDF (Final)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pricing">Preço (R$)</Label>
                  <Input
                    id="pricing"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o template e quando usar..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createTemplate.isPending}>
                  {createTemplate.isPending ? 'Criando...' : 'Criar Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum template configurado ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Crie templates para automatizar a geração de documentos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getFileTypeIcon(template.file_type)}
                    {template.name}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {templateCategories.find(cat => cat.value === template.category)?.label || template.category}
                    </Badge>
                    <Badge variant="secondary">
                      {template.file_type.toUpperCase()}
                    </Badge>
                    <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                      {template.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {formatPrice(template.pricing)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTemplateId(template.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {template.description || 'Sem descrição'}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Versão {template.version}</span>
                  <span>Arquivo: {template.file_path}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Template</Label>
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
                  {templateCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-file_type">Formato</Label>
                <Select value={formData.file_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, file_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docx">DOCX (Editável)</SelectItem>
                    <SelectItem value="json">JSON (Estruturado)</SelectItem>
                    <SelectItem value="html">HTML (Web)</SelectItem>
                    <SelectItem value="pdf">PDF (Final)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-pricing">Preço (R$)</Label>
                <Input
                  id="edit-pricing"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricing}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: parseFloat(e.target.value) || 0 }))}
                />
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
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateTemplate.isPending}>
                {updateTemplate.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteTemplate.isPending}>
              {deleteTemplate.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplateManager;