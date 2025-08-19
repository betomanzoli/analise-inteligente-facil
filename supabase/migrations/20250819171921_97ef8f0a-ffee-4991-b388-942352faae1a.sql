
-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, 
  26214400, -- 25MB in bytes
  ARRAY['application/pdf']
);

-- Create table for analysis records
CREATE TABLE public.analysis_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  instruction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  result TEXT,
  error_message TEXT,
  n8n_execution_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RLS policies for analysis records (public access for MVP)
ALTER TABLE public.analysis_records ENABLE ROW LEVEL SECURITY;

-- Allow public read access for MVP phase
CREATE POLICY "Allow public read access" ON public.analysis_records
  FOR SELECT USING (true);

-- Allow public insert access for MVP phase
CREATE POLICY "Allow public insert access" ON public.analysis_records
  FOR INSERT WITH CHECK (true);

-- Allow public update access for MVP phase
CREATE POLICY "Allow public update access" ON public.analysis_records
  FOR UPDATE USING (true);

-- Storage policies for documents bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_analysis_records_updated_at
  BEFORE UPDATE ON public.analysis_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
