-- Fix dependency issue by dropping trigger first, then recreating both
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();