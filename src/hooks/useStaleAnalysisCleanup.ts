
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStaleAnalysisCleanup = () => {
  const { toast } = useToast();

  const cleanupStaleAnalyses = useCallback(async () => {
    try {
      console.log('Iniciando limpeza de análises órfãs...');
      
      const { data, error } = await supabase.functions.invoke('cleanup-stale-analyses');
      
      if (error) {
        console.error('Erro na limpeza de análises órfãs:', error);
        return;
      }

      if (data && data.updated_count > 0) {
        console.log(`Limpeza concluída: ${data.updated_count} análises órfãs foram marcadas como erro`);
        
        toast({
          title: "Sistema atualizado",
          description: `${data.updated_count} processo(s) órfão(s) foram marcados como erro e podem ser tentados novamente.`,
        });
      }
    } catch (error) {
      console.error('Falha na limpeza de análises órfãs:', error);
      // Não mostrar toast de erro para não incomodar o usuário com erros de background
    }
  }, [toast]);

  // Executar limpeza periodicamente
  useEffect(() => {
    // Executar uma vez ao carregar (com delay para evitar múltiplas execuções)
    const initialTimeout = setTimeout(() => {
      cleanupStaleAnalyses();
    }, 2000);
    
    // Configurar execução periódica (a cada 5 minutos)
    const interval = setInterval(cleanupStaleAnalyses, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [cleanupStaleAnalyses]);

  return {
    cleanupStaleAnalyses,
  };
};
