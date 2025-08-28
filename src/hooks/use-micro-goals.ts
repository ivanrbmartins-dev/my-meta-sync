import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MicroGoal {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMicroGoalData {
  title: string;
  description?: string;
}

export function useMicroGoals(goalId?: string) {
  const [microGoals, setMicroGoals] = useState<MicroGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMicroGoals = async (targetGoalId?: string) => {
    if (!targetGoalId && !goalId) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('micro_goals')
        .select('*')
        .eq('goal_id', targetGoalId || goalId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMicroGoals(data || []);
    } catch (error) {
      console.error('Error fetching micro goals:', error);
      toast({
        title: "Erro ao carregar micro metas",
        description: "Não foi possível carregar as micro metas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMicroGoal = async (targetGoalId: string, microGoalData: CreateMicroGoalData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar micro metas.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('micro_goals')
        .insert([{
          goal_id: targetGoalId,
          title: microGoalData.title,
          description: microGoalData.description || null,
        }]);

      if (error) throw error;

      toast({
        title: "Micro meta criada!",
        description: `"${microGoalData.title}" foi adicionada.`,
      });

      // Recarregar as micro metas
      await fetchMicroGoals(targetGoalId);
      return true;
    } catch (error) {
      console.error('Error creating micro goal:', error);
      toast({
        title: "Erro ao criar micro meta",
        description: "Não foi possível criar a micro meta. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleMicroGoal = async (microGoalId: string, targetGoalId?: string) => {
    try {
      const microGoal = microGoals.find(mg => mg.id === microGoalId);
      if (!microGoal) return false;

      const newCompletedState = !microGoal.is_completed;
      const { error } = await supabase
        .from('micro_goals')
        .update({
          is_completed: newCompletedState,
          completed_at: newCompletedState ? new Date().toISOString() : null,
        })
        .eq('id', microGoalId);

      if (error) throw error;

      toast({
        title: newCompletedState ? "Progresso registrado!" : "Progresso removido",
        description: newCompletedState 
          ? `"${microGoal.title}" foi marcada como concluída.`
          : `"${microGoal.title}" foi desmarcada.`,
      });

      // Recarregar as micro metas
      await fetchMicroGoals(targetGoalId || goalId);
      return true;
    } catch (error) {
      console.error('Error toggling micro goal:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Não foi possível atualizar o progresso. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMicroGoal = async (microGoalId: string, targetGoalId?: string) => {
    try {
      const { error } = await supabase
        .from('micro_goals')
        .delete()
        .eq('id', microGoalId);

      if (error) throw error;

      toast({
        title: "Micro meta deletada!",
        description: "A micro meta foi removida permanentemente.",
      });

      // Recarregar as micro metas
      await fetchMicroGoals(targetGoalId || goalId);
      return true;
    } catch (error) {
      console.error('Error deleting micro goal:', error);
      toast({
        title: "Erro ao deletar micro meta",
        description: "Não foi possível deletar a micro meta. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (goalId) {
      fetchMicroGoals();
    }
  }, [goalId]);

  return {
    microGoals,
    loading,
    createMicroGoal,
    toggleMicroGoal,
    deleteMicroGoal,
    refetch: fetchMicroGoals,
  };
}