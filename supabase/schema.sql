-- ==============================================================================
-- TAPCARD PRODUCTION DATABASE SCHEMA & INITIAL MIGRATION
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. APP SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. ADMIN USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    designation TEXT,
    company TEXT,
    bio TEXT,
    profile_photo TEXT,
    cover_image TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'India',
    linkedin TEXT,
    instagram TEXT,
    facebook TEXT,
    twitter TEXT,
    youtube TEXT,
    github TEXT,
    theme TEXT DEFAULT 'professional',
    accent_color TEXT DEFAULT '#2563eb',
    font_family TEXT DEFAULT 'inter',
    services JSONB DEFAULT '[]'::jsonb,
    custom_whatsapp_message TEXT DEFAULT 'Hi, I saw your TapCard and would love to connect!',
    is_public BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- ------------------------------------------------------------------------------
-- 4. CARDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cards (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    card_code TEXT UNIQUE NOT NULL,
    profile_id TEXT,
    user_id TEXT,
    card_type TEXT DEFAULT 'matte_black',
    design_template TEXT DEFAULT 'corporate',
    status TEXT DEFAULT 'ACTIVE',
    short_url TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_card_code ON public.cards(card_code);
CREATE INDEX IF NOT EXISTS idx_cards_profile_id ON public.cards(profile_id);

-- ------------------------------------------------------------------------------
-- 5. LEADS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    profile_id TEXT NOT NULL,
    card_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'direct',
    status TEXT DEFAULT 'NEW',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. ANALYTICS EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    profile_id TEXT NOT NULL,
    card_id TEXT,
    event_type TEXT NOT NULL,
    source TEXT DEFAULT 'direct',
    session_id TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    profile_id TEXT,
    card_id TEXT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    card_type TEXT NOT NULL,
    design TEXT DEFAULT 'corporate',
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_status TEXT DEFAULT 'PENDING',
    order_status TEXT DEFAULT 'PENDING',
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. STORAGE BUCKET FOR AVATARS & IMAGES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('tapcard-assets', 'tapcard-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active profiles" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL TO public USING (true);
CREATE POLICY "Public can lookup cards" ON public.cards FOR SELECT TO public USING (true);
CREATE POLICY "Cards manage" ON public.cards FOR ALL TO public USING (true);
CREATE POLICY "Public can insert lead" ON public.leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users view leads" ON public.leads FOR ALL TO public USING (true);
CREATE POLICY "Public insert analytics" ON public.analytics_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read storage" ON storage.objects FOR SELECT TO public USING (bucket_id = 'tapcard-assets');
CREATE POLICY "Public upload storage" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'tapcard-assets');
