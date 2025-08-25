
-- Ativar a extensão pgvector para suporte a embeddings vetoriais
CREATE EXTENSION IF NOT EXISTS vector;

-- Criar tabela para armazenar os chunks de documentos com seus embeddings
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_record_id UUID NOT NULL REFERENCES analysis_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- Dimensão padrão para embeddings do OpenAI/Vertex AI
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance de busca vetorial
CREATE INDEX document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Índices para consultas por documento e usuário
CREATE INDEX document_chunks_analysis_record_id_idx ON public.document_chunks(analysis_record_id);
CREATE INDEX document_chunks_user_id_idx ON public.document_chunks(user_id);

-- Habilitar RLS na tabela de chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas seus próprios chunks
CREATE POLICY "Users can view their own document chunks"
  ON public.document_chunks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para inserção de chunks (permitir para usuários autenticados)
CREATE POLICY "Users can create their own document chunks"
  ON public.document_chunks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para atualização de chunks
CREATE POLICY "Users can update their own document chunks"
  ON public.document_chunks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para exclusão de chunks
CREATE POLICY "Users can delete their own document chunks"
  ON public.document_chunks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_document_chunks_updated_at
  BEFORE UPDATE ON public.document_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela para armazenar configurações de embedding por usuário
CREATE TABLE public.embedding_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  chunk_size INTEGER NOT NULL DEFAULT 1000,
  chunk_overlap INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para configurações de embedding
ALTER TABLE public.embedding_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own embedding configs"
  ON public.embedding_configs
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_embedding_configs_updated_at
  BEFORE UPDATE ON public.embedding_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para busca de similaridade vetorial
CREATE OR REPLACE FUNCTION public.search_similar_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  analysis_record_id uuid,
  content text,
  similarity float,
  metadata jsonb,
  file_name text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.analysis_record_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.metadata,
    ar.file_name,
    dc.created_at
  FROM document_chunks dc
  JOIN analysis_records ar ON dc.analysis_record_id = ar.id
  WHERE 
    1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (filter_user_id IS NULL OR dc.user_id = filter_user_id)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
