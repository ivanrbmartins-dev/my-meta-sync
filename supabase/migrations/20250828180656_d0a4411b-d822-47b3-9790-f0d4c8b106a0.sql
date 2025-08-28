-- Create micro_goals table
CREATE TABLE public.micro_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.micro_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for micro_goals
CREATE POLICY "Users can view micro goals for their own goals" 
ON public.micro_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = micro_goals.goal_id 
    AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create micro goals for their own goals" 
ON public.micro_goals 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = micro_goals.goal_id 
    AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update micro goals for their own goals" 
ON public.micro_goals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = micro_goals.goal_id 
    AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete micro goals for their own goals" 
ON public.micro_goals 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.goals 
    WHERE goals.id = micro_goals.goal_id 
    AND goals.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_micro_goals_updated_at
BEFORE UPDATE ON public.micro_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update goal progress based on micro goals
CREATE OR REPLACE FUNCTION public.update_goal_progress_from_micro_goals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent goal's progress based on completed micro goals
  UPDATE public.goals 
  SET progress = (
    SELECT CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE is_completed = true) * 100.0) / COUNT(*))
    END
    FROM public.micro_goals 
    WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
  )
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create triggers to automatically update goal progress when micro goals change
CREATE TRIGGER update_goal_progress_on_micro_goal_insert
AFTER INSERT ON public.micro_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_progress_from_micro_goals();

CREATE TRIGGER update_goal_progress_on_micro_goal_update
AFTER UPDATE ON public.micro_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_progress_from_micro_goals();

CREATE TRIGGER update_goal_progress_on_micro_goal_delete
AFTER DELETE ON public.micro_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_progress_from_micro_goals();