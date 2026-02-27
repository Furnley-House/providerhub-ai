
-- Fix cases policies
DROP POLICY IF EXISTS "Authenticated users can manage cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated users can view cases" ON public.cases;
CREATE POLICY "Anyone can view cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Anyone can manage cases" ON public.cases FOR ALL USING (true) WITH CHECK (true);

-- Fix documents policies
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Anyone can view documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Anyone can manage documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- Fix checklist_fields policies
DROP POLICY IF EXISTS "Authenticated users can manage checklist fields" ON public.checklist_fields;
DROP POLICY IF EXISTS "Authenticated users can view checklist fields" ON public.checklist_fields;
CREATE POLICY "Anyone can view checklist fields" ON public.checklist_fields FOR SELECT USING (true);
CREATE POLICY "Anyone can manage checklist fields" ON public.checklist_fields FOR ALL USING (true) WITH CHECK (true);

-- Fix tasks policies
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can manage tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- Fix providers policies
DROP POLICY IF EXISTS "Authenticated users can manage providers" ON public.providers;
DROP POLICY IF EXISTS "Authenticated users can view providers" ON public.providers;
CREATE POLICY "Anyone can view providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Anyone can manage providers" ON public.providers FOR ALL USING (true) WITH CHECK (true);

-- Fix automation_rules policies
DROP POLICY IF EXISTS "Authenticated users can manage rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Authenticated users can view rules" ON public.automation_rules;
CREATE POLICY "Anyone can view rules" ON public.automation_rules FOR SELECT USING (true);
CREATE POLICY "Anyone can manage rules" ON public.automation_rules FOR ALL USING (true) WITH CHECK (true);

-- Fix call_logs policies
DROP POLICY IF EXISTS "Authenticated users can view call logs" ON public.call_logs;
DROP POLICY IF EXISTS "Users can manage their own call logs" ON public.call_logs;
CREATE POLICY "Anyone can view call logs" ON public.call_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can manage call logs" ON public.call_logs FOR ALL USING (true) WITH CHECK (true);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can manage profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Fix storage policies
DROP POLICY IF EXISTS "Auth users can delete policy docs" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload policy docs" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view policy docs" ON storage.objects;
CREATE POLICY "Anyone can upload policy docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'policy-documents');
CREATE POLICY "Anyone can view policy docs" ON storage.objects FOR SELECT USING (bucket_id = 'policy-documents');
CREATE POLICY "Anyone can delete policy docs" ON storage.objects FOR DELETE USING (bucket_id = 'policy-documents');
CREATE POLICY "Anyone can update policy docs" ON storage.objects FOR UPDATE USING (bucket_id = 'policy-documents');
