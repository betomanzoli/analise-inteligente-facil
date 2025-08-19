
-- Create user profiles table for authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Add user_id to analysis_records for authenticated users
ALTER TABLE public.analysis_records ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for analysis_records to support both authenticated and anonymous users
DROP POLICY IF EXISTS "Allow public read access" ON public.analysis_records;
DROP POLICY IF EXISTS "Allow public insert access" ON public.analysis_records;
DROP POLICY IF EXISTS "Allow public update access" ON public.analysis_records;

-- New policies that support both modes
CREATE POLICY "Allow authenticated users to view their own records" 
  ON public.analysis_records 
  FOR SELECT 
  USING (
    auth.uid() IS NULL OR -- Allow anonymous access
    auth.uid() = user_id  -- Allow users to see their own records
  );

CREATE POLICY "Allow insert for authenticated and anonymous users" 
  ON public.analysis_records 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NULL OR -- Allow anonymous inserts
    auth.uid() = user_id  -- Allow authenticated users to insert their own records
  );

CREATE POLICY "Allow update for authenticated and anonymous users" 
  ON public.analysis_records 
  FOR UPDATE 
  USING (
    auth.uid() IS NULL OR -- Allow anonymous updates (for webhook callbacks)
    auth.uid() = user_id  -- Allow users to update their own records
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
