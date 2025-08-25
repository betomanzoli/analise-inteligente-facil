
-- Criar tabela de projetos
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name, user_id)
);

-- Criar tabela de tags
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name, user_id)
);

-- Criar tabela de relacionamento entre documentos e projetos
CREATE TABLE public.document_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_record_id uuid REFERENCES public.analysis_records(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(analysis_record_id, project_id)
);

-- Criar tabela de relacionamento entre documentos e tags
CREATE TABLE public.document_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_record_id uuid REFERENCES public.analysis_records(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(analysis_record_id, tag_id)
);

-- Adicionar colunas para metadados na tabela analysis_records
ALTER TABLE public.analysis_records 
ADD COLUMN project_name text,
ADD COLUMN batch_id uuid DEFAULT gen_random_uuid();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para tags
CREATE POLICY "Users can view their own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para document_projects
CREATE POLICY "Users can view their own document projects" ON public.document_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analysis_records ar 
      WHERE ar.id = document_projects.analysis_record_id 
      AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create their own document projects" ON public.document_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_records ar 
      WHERE ar.id = document_projects.analysis_record_id 
      AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete their own document projects" ON public.document_projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.analysis_records ar 
      WHERE ar.id = document_projects.analysis_record_id 
      AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    )
  );

-- Políticas RLS para document_tags
CREATE POLICY "Users can view their own document tags" ON public.document_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analysis_records ar 
      WHERE ar.id = document_tags.analysis_record_id 
      AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create their own document tags" ON public.document_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_records ar 
      WHERE ar.id = document_tags.analysis_record_id 
      AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete their own document tags" ON public.document_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.analysis_records ar 
      WHERE ar.id = document_tags.analysis_record_id 
      AND (ar.user_id = auth.uid() OR ar.user_id IS NULL)
    )
  );

-- Trigger para atualizar updated_at na tabela projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
