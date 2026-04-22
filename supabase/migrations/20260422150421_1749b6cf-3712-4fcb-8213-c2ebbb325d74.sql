ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS zoho_ceding_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS zoho_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS sr_prepared_at timestamptz;

CREATE INDEX IF NOT EXISTS cases_zoho_ceding_status_idx
  ON public.cases (zoho_ceding_status);
