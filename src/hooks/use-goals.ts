import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type GoalStatus = "planned" | "in_progress" | "completed" | "overdue" | "paused";
export type GoalPriority = "high" | "medium" | "low";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  dueDate: string;
  startDate: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  category?: string;
  priority: GoalPriority;
  startDate?: string;
  dueDate: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals = data?.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status as GoalStatus,
        priority: goal.priority as GoalPriority,
        progress: goal.progress,
        dueDate: goal.due_date,
        startDate: goal.start_date,
        category: goal.category,
        created_at: goal.created_at,
        updated_at: goal.updated_at,
      })) || [];

      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Erro ao carregar metas",
        description: "Não foi possível carregar suas metas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateGoalData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar metas.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          title: goalData.title,
          description: goalData.description || null,
          category: goalData.category || null,
          priority: goalData.priority,
          start_date: goalData.startDate || null,
          due_date: goalData.dueDate,
        }]);

      if (error) throw error;

      toast({
        title: "Meta criada com sucesso!",
        description: `"${goalData.title}" foi adicionada às suas metas.`,
      });

      // Recarregar as metas
      await fetchGoals();
      return true;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Erro ao criar meta",
        description: "Não foi possível criar a meta. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateGoal = async (goalId: string, goalData: Partial<CreateGoalData & { status: GoalStatus; progress: number }>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para editar metas.",
          variant: "destructive",
        });
        return false;
      }

      const updateData: any = {};
      if (goalData.title !== undefined) updateData.title = goalData.title;
      if (goalData.description !== undefined) updateData.description = goalData.description || null;
      if (goalData.category !== undefined) updateData.category = goalData.category || null;
      if (goalData.priority !== undefined) updateData.priority = goalData.priority;
      if (goalData.startDate !== undefined) updateData.start_date = goalData.startDate || null;
      if (goalData.dueDate !== undefined) updateData.due_date = goalData.dueDate;
      if (goalData.status !== undefined) updateData.status = goalData.status;
      if (goalData.progress !== undefined) updateData.progress = goalData.progress;

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });

      // Recarregar as metas
      await fetchGoals();
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Erro ao atualizar meta",
        description: "Não foi possível atualizar a meta. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para deletar metas.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta deletada com sucesso!",
        description: "A meta foi removida permanentemente.",
      });

      // Recarregar as metas
      await fetchGoals();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erro ao deletar meta",
        description: "Não foi possível deletar a meta. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}