-- Initial Schema for CompSci Talks Platform

-- 1. Tables

CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    affiliation TEXT
);

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color_code TEXT DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS public.seminars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    abstract TEXT,
    thumbnail_url TEXT,
    speaker_ids UUID[] DEFAULT '{}',
    tag_ids UUID[] DEFAULT '{}',
    video_material_id TEXT,
    presentation_material_id TEXT,
    is_hidden BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seminar_id UUID REFERENCES public.seminars(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rsvps (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seminar_id UUID REFERENCES public.seminars(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, seminar_id)
);

-- Public Profile Mirror
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'authenticated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Functions & Triggers

-- Function to atomically set active semester
CREATE OR REPLACE FUNCTION public.set_active_semester(target_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.semesters SET is_active = FALSE;
  UPDATE public.semesters SET is_active = TRUE WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RLS Policies

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Allow public read access to seminars" ON public.seminars FOR SELECT USING (true);
CREATE POLICY "Allow public read access to speakers" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tags" ON public.tags FOR SELECT USING (true);

-- Authenticated access
CREATE POLICY "Allow authenticated read access to comments" ON public.comments FOR SELECT TO authenticated USING (NOT is_hidden);
CREATE POLICY "Allow users to manage their own comments" ON public.comments FOR ALL TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Allow users to manage their own rsvps" ON public.rsvps FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read profiles" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to update own profile" ON public.users FOR ALL TO authenticated USING (auth.uid() = id);

-- Admin access (based on role column)
-- Note: Simplified admin check. Real implementations often use JWT claims or specialized tables.
CREATE POLICY "Admins have full access to semesters" ON public.semesters FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins have full access to seminars" ON public.seminars FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins have full access to speakers" ON public.speakers FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins have full access to tags" ON public.tags FOR ALL TO authenticated USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Admins have full access to comments" ON public.comments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
