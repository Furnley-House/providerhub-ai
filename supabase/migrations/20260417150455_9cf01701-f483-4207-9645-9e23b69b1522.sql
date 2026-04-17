ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_owner_id_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_recipient_user_id_fkey;