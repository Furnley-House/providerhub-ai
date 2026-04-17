
ALTER TABLE public.checklist_fields DROP CONSTRAINT IF EXISTS checklist_fields_confidence_check;
ALTER TABLE public.checklist_fields DROP CONSTRAINT IF EXISTS checklist_fields_status_check;
ALTER TABLE public.checklist_fields DROP CONSTRAINT IF EXISTS checklist_fields_evidence_source_check;

UPDATE public.checklist_fields SET confidence = UPPER(confidence) WHERE confidence IS NOT NULL;
UPDATE public.checklist_fields SET confidence = 'MISSING' WHERE confidence IS NULL;

ALTER TABLE public.checklist_fields
  ADD CONSTRAINT checklist_fields_confidence_check
  CHECK (confidence IN ('HIGH','MEDIUM','LOW','MISSING'));

ALTER TABLE public.checklist_fields
  ADD CONSTRAINT checklist_fields_status_check
  CHECK (status IN ('missing','pending','approved','review_requested','needs_review','complete'));
