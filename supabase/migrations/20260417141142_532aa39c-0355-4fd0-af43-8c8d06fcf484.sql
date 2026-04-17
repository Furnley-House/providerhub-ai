-- Checklist fields: extraction + edit metadata
ALTER TABLE public.checklist_fields
  ADD COLUMN IF NOT EXISTS field_key text,
  ADD COLUMN IF NOT EXISTS source_page integer,
  ADD COLUMN IF NOT EXISTS extracted_at timestamptz,
  ADD COLUMN IF NOT EXISTS manually_edited boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS checklist_fields_case_key_uniq
  ON public.checklist_fields (case_id, field_key)
  WHERE field_key IS NOT NULL;

-- Documents: extraction lifecycle
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS extraction_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS extraction_error text;

-- Field audit log
CREATE TABLE IF NOT EXISTS public.field_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  field_key text,
  field_label text,
  action text NOT NULL, -- 'ai_extract' | 'manual_edit' | 'approve' | 'request_review' | 'comment' | 'status_change'
  source text NOT NULL DEFAULT 'manual', -- 'ai' | 'manual' | 'system'
  old_value text,
  new_value text,
  confidence text,
  actor_role text,
  actor_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS field_audit_case_idx ON public.field_audit (case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS field_audit_field_idx ON public.field_audit (case_id, field_key);

ALTER TABLE public.field_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view field audit"
  ON public.field_audit FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert field audit"
  ON public.field_audit FOR INSERT
  WITH CHECK (true);