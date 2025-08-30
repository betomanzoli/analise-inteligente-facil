
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalysisRecord {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'text_extracted' | 'completed' | 'error';
  result?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  file_size: number;
  file_path: string;
  instruction: string;
  project_name?: string;
}

export const useAnalysisHistory = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['analysis-history', user?.id],
    queryFn: async (): Promise<AnalysisRecord[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('analysis_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure status matches our union type
      return (data || []).map(record => ({
        ...record,
        status: record.status as 'pending' | 'processing' | 'text_extracted' | 'completed' | 'error'
      }));
    },
    enabled: !!user,
  });

  return {
    ...query,
    analyses: query.data || [],
    refreshAnalyses: query.refetch,
  };
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
      
      // Type assertion to ensure status matches our union type
      return data ? {
        ...data,
        status: data.status as 'pending' | 'processing' | 'text_extracted' | 'completed' | 'error'
      } : null;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Keep polling if status is pending or processing
      const data = query.state.data;
      if (data && (data.status === 'pending' || data.status === 'processing' || data.status === 'text_extracted')) {
        return 3000;
      }
      return false;
    },
  });
};
