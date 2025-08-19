import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalysisRecord {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  file_size: number;
  instruction: string;
}

export const useAnalysisHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analysis-history', user?.id],
    queryFn: async (): Promise<AnalysisRecord[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('analysis_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useAnalysisRecord = (id: string | null) => {
  return useQuery({
    queryKey: ['analysis-record', id],
    queryFn: async (): Promise<AnalysisRecord | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('analysis_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    refetchInterval: (data) => {
      // Keep polling if status is pending or processing
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });
};
