import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalysisPrompt {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  description?: string;
  variables?: any;
  usage_count: number;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useAnalysisPrompts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analysis_prompts', user?.id],
    queryFn: async (): Promise<AnalysisPrompt[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('analysis_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateAnalysisPrompt = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompt: Omit<AnalysisPrompt, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('analysis_prompts')
        .insert({
          ...prompt,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis_prompts'] });
    },
  });
};

export const useUpdateAnalysisPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AnalysisPrompt> }) => {
      const { data, error } = await supabase
        .from('analysis_prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis_prompts'] });
    },
  });
};

export const useDeleteAnalysisPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('analysis_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis_prompts'] });
    },
  });
};