ALTER TABLE public.cases 
  ADD COLUMN IF NOT EXISTS current_stage integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stages_completed integer[] NOT NULL DEFAULT '{}'::int[],
  ADD COLUMN IF NOT EXISTS plan_ref text,
  ADD COLUMN IF NOT EXISTS zoho_task_id text,
  ADD COLUMN IF NOT EXISTS case_notes text,
  ADD COLUMN IF NOT EXISTS rag text NOT NULL DEFAULT 'green',
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS assigned_role text;