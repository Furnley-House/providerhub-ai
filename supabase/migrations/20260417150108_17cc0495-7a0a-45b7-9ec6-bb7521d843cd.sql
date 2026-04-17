CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID NOT NULL,
  recipient_role TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  actor_name TEXT,
  actor_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_user_id, read, created_at DESC);
CREATE INDEX idx_notifications_case ON public.notifications(case_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notifications"
ON public.notifications FOR SELECT USING (true);

CREATE POLICY "Anyone can manage notifications"
ON public.notifications FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;