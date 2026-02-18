
-- Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'ca_team',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Providers
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  portal_url TEXT,
  origo_supported BOOLEAN DEFAULT false,
  avg_turnaround INTEGER DEFAULT 14,
  last_verified DATE,
  routing_rules JSONB DEFAULT '[]',
  jargon_map JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view providers" ON public.providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage providers" ON public.providers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Cases
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_ref TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  provider_id UUID REFERENCES public.providers(id),
  provider_name TEXT NOT NULL,
  plan_number TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'Personal Pension',
  status TEXT NOT NULL DEFAULT 'loa_sent',
  owner_id UUID REFERENCES auth.users(id),
  owner_name TEXT,
  loa_sent_date DATE,
  processing_expected DATE,
  pdf_expected_date DATE,
  pdf_received_date DATE,
  ai_extraction_date DATE,
  ceding_complete_date DATE,
  current_value TEXT,
  transfer_value TEXT,
  is_overdue BOOLEAN DEFAULT false,
  missing_fields_count INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view cases" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage cases" ON public.cases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  provider_name TEXT,
  document_type TEXT DEFAULT 'Policy Information',
  status TEXT NOT NULL DEFAULT 'pending',
  fields_extracted INTEGER DEFAULT 0,
  avg_confidence INTEGER DEFAULT 0,
  extracted_data JSONB,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage documents" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Checklist fields
CREATE TABLE public.checklist_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  evidence_source TEXT CHECK (evidence_source IN ('pdf', 'call', 'email', 'manual')),
  evidence_ref TEXT,
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('complete', 'missing', 'needs_review')),
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view checklist fields" ON public.checklist_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage checklist fields" ON public.checklist_fields FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chase', 'call', 'review', 'upload')),
  title TEXT NOT NULL,
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_name TEXT,
  completed BOOLEAN DEFAULT false,
  client_name TEXT,
  provider_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Automation rules
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  action_description TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view rules" ON public.automation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage rules" ON public.automation_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON public.checklist_fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for policy PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('policy-documents', 'policy-documents', false);
CREATE POLICY "Auth users can upload policy docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'policy-documents');
CREATE POLICY "Auth users can view policy docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'policy-documents');
CREATE POLICY "Auth users can delete policy docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'policy-documents');
