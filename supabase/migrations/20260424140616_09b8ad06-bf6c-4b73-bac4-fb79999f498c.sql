ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS loa_method text,
  ADD COLUMN IF NOT EXISTS loa_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS loa_tracking_ref text,
  ADD COLUMN IF NOT EXISTS loa_notes text;