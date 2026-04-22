UPDATE public.cases
SET zoho_ceding_status = 'ceding_complete',
    zoho_synced_at = COALESCE(zoho_synced_at, now())
WHERE status IN ('complete', 'approved')
  AND zoho_ceding_status = 'not_started';
