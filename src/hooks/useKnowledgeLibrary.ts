
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface KnowledgeDocument {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  instruction: string;
  project_name?: string;
  created_at: string;
  updated_at: string;
  file_size: number;
  batch_id?: string;
  projects?: { id: string; name: string; description?: string }[];
  tags?: { id: string; name: string }[];
}

export interface LibraryFilters {
  status?: string;
  projectId?: string;
  tagId?: string;
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const useKnowledgeLibrary = (filters: LibraryFilters = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['knowledge-library', user?.id, filters],
    queryFn: async (): Promise<KnowledgeDocument[]> => {
      if (!user) return [];

      let query = supabase
        .from('analysis_records')
        .select(`
          *,
          document_projects!inner(
            projects(id, name, description)
          ),
          document_tags!inner(
            tags(id, name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply project filter
      if (filters.projectId) {
        query = query.eq('document_projects.project_id', filters.projectId);
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`file_name.ilike.%${filters.search}%,instruction.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match our interface
      return (data || []).map(record => ({
        ...record,
        status: record.status as 'pending' | 'processing' | 'completed' | 'error',
        projects: record.document_projects?.map((dp: any) => dp.projects) || [],
        tags: record.document_tags?.map((dt: any) => dt.tags) || [],
      }));
    },
    enabled: !!user,
  });
};

export const useKnowledgeStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['knowledge-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('analysis_records')
        .select('status, file_size')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(r => r.status === 'completed').length,
        processing: data.filter(r => r.status === 'processing' || r.status === 'pending').length,
        failed: data.filter(r => r.status === 'error').length,
        totalSize: data.reduce((sum, r) => sum + (r.file_size || 0), 0),
      };

      return stats;
    },
    enabled: !!user,
  });
};
