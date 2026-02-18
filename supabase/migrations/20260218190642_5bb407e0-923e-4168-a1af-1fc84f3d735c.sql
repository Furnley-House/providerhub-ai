-- Call logs table for tracking calls made to providers
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  department TEXT,
  phone_number TEXT NOT NULL,
  plan_number TEXT,
  client_name TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'completed',
  transcript TEXT,
  ai_summary TEXT,
  notes TEXT,
  fields_resolved TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- Users can view all call logs (internal team)
CREATE POLICY "Authenticated users can view call logs"
ON public.call_logs FOR SELECT
USING (true);

-- Users can manage their own call logs
CREATE POLICY "Users can manage their own call logs"
ON public.call_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_call_logs_updated_at
BEFORE UPDATE ON public.call_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();