-- ==========================================
-- Complete Supabase Schema for Sellfast SaaS
-- ==========================================

-- Enable the uuid-ossp extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Stores user credits and status)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  credits integer default 50 not null,
  is_demo boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Logs Table (For auditing credit deductions and admin actions)
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  action_type text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Payment Requests Table (For recharge requests)
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan_id text not null,
  amount numeric not null,
  credits integer not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references auth.users(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Projects Table (Stores user workspaces/projects)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  studio text, -- e.g. 'UGC Studio', 'Voice Studio'
  name text,
  description text,
  data jsonb, -- Stores the full state of the project
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Brand Kits Table (User's visual identity & colors)
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,
  colors jsonb,
  fonts jsonb,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Assets Table (Content Library - Images, Videos, Plans)
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  asset_type text not null, -- e.g., 'CREATOR_IMAGE', 'CAMPAIGN_PLAN', 'AD_VIDEO'
  url text, -- Can be base64 string or remote URL
  config jsonb, -- Additional parameters used during generation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Video Jobs Table (Tracks background rendering tasks)
CREATE TABLE IF NOT EXISTS public.video_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'processing',
  metadata jsonb,
  result_url text,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- Logs Policies
DROP POLICY IF EXISTS "Users can insert logs" ON public.logs;
CREATE POLICY "Users can insert logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own logs" ON public.logs;
CREATE POLICY "Users can view own logs" ON public.logs FOR SELECT USING (auth.uid() = user_id);


-- Payment Requests Policies
DROP POLICY IF EXISTS "Users can insert own payment requests" ON public.payment_requests;
CREATE POLICY "Users can insert own payment requests" ON public.payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payment requests" ON public.payment_requests;
CREATE POLICY "Users can view own payment requests" ON public.payment_requests FOR SELECT USING (auth.uid() = user_id);


-- Projects Policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);


-- Brand Kits Policies
DROP POLICY IF EXISTS "Users can view own brand kits" ON public.brand_kits;
CREATE POLICY "Users can view own brand kits" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own brand kits" ON public.brand_kits;
CREATE POLICY "Users can insert own brand kits" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own brand kits" ON public.brand_kits;
CREATE POLICY "Users can update own brand kits" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own brand kits" ON public.brand_kits;
CREATE POLICY "Users can delete own brand kits" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);


-- Assets Policies
DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id);


-- Video Jobs Policies
DROP POLICY IF EXISTS "Users can view own video jobs" ON public.video_jobs;
CREATE POLICY "Users can view own video jobs" ON public.video_jobs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own video jobs" ON public.video_jobs;
CREATE POLICY "Users can insert own video jobs" ON public.video_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own video jobs" ON public.video_jobs;
CREATE POLICY "Users can update own video jobs" ON public.video_jobs FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle auto-creating profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits, is_demo)
  VALUES (new.id, 50, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Campaigns Table (Stores unified multi-tool outputs)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_name text not null,
  campaign_goal text,
  selected_angle text,
  
  -- Structured Data (using jsonb for flexibility)
  reels_script text,
  shots jsonb, -- The shot list array
  ugc_script text,
  performance_ads jsonb, -- The array of 3 ads
  viral_hooks jsonb, -- The 10 hooks
  sales_angles jsonb, -- The 6 strategy angles
  photoshoot_brief jsonb, -- Poses, backgrounds, props
  
  -- Versioning & Multi-Engine Meta (New)
  version integer default 1,
  status text default 'draft' check (status in ('draft', 'final', 'active')),
  parent_id uuid references public.campaigns(id) on delete set null,
  original_analysis jsonb, -- Stores targeting, strategicDepth, and launchCaptions (Super-Intelligence)
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaigns Policies
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
CREATE POLICY "Users can insert own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON public.campaigns(created_at DESC);
