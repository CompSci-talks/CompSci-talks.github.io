-- Fix Admin RLS Policies and Profile Update
-- This migration fixes circular dependencies and restricted update permissions

-- 1. Fix User Profile Update (Allow full management for own profile)
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
CREATE POLICY "Allow users to update own profile" ON public.users FOR ALL TO authenticated USING (auth.uid() = id);

-- 2. Fix Admin Policies (Use subqueries to avoid circular EXISTS checks during INSERT)
DROP POLICY IF EXISTS "Admins have full access to semesters" ON public.semesters;
CREATE POLICY "Admins have full access to semesters" ON public.semesters FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins have full access to seminars" ON public.seminars;
CREATE POLICY "Admins have full access to seminars" ON public.seminars FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins have full access to speakers" ON public.speakers;
CREATE POLICY "Admins have full access to speakers" ON public.speakers FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins have full access to tags" ON public.tags;
CREATE POLICY "Admins have full access to tags" ON public.tags FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins have full access to comments" ON public.comments;
CREATE POLICY "Admins have full access to comments" ON public.comments FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
