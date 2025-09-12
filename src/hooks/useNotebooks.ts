import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notebook {
  id: string;
  name: string;
  url: string;
  category: string;
  priority: number;
  status: string;
  description?: string;
  tags?: string[];
  last_tested_at?: string;
  connectivity_status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useNotebooks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notebooks', user?.id],
    queryFn: async (): Promise<Notebook[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateNotebook = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notebook: Omit<Notebook, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'connectivity_status' | 'last_tested_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          ...notebook,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
};

export const useUpdateNotebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Notebook> }) => {
      const { data, error } = await supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
};

export const useDeleteNotebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
};

export const useTestNotebookConnectivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Simular teste de conectividade por enquanto
      // Na implementação real, isso faria uma chamada para uma edge function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const connectivity_status = Math.random() > 0.2 ? 'connected' : 'failed';
      
      const { data, error } = await supabase
        .from('notebooks')
        .update({ 
          connectivity_status,
          last_tested_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
};