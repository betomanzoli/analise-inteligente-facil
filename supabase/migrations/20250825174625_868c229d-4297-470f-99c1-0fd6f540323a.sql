
-- Adicionar coluna file_hash para verificação de duplicatas
ALTER TABLE public.analysis_records 
ADD COLUMN file_hash text;

-- Criar índice único no hash para performance e evitar duplicatas
CREATE UNIQUE INDEX idx_analysis_records_file_hash 
ON public.analysis_records(file_hash) 
WHERE file_hash IS NOT NULL;

-- Adicionar coluna para melhor controle de timeout de análises
ALTER TABLE public.analysis_records 
ADD COLUMN processing_timeout timestamp with time zone;
