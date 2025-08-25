
-- Migração para Vertex AI Embeddings (768 dimensões)
-- Passo 1: Remover o índice existente
DROP INDEX IF EXISTS document_chunks_embedding_idx;

-- Passo 2: Alterar a coluna embedding para 768 dimensões
ALTER TABLE public.document_chunks 
ALTER COLUMN embedding TYPE vector(768);

-- Passo 3: Recriar o índice vetorial com as novas dimensões
CREATE INDEX document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Passo 4: Atualizar a função de busca para as novas dimensões
CREATE OR REPLACE FUNCTION public.search_similar_chunks(
  query_embedding vector(768),
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
