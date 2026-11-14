-- ==============================================================================
-- TAPCARD PRODUCTION DATABASE SCHEMA & INITIAL MIGRATION
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. APP SETTINGS (Configurable platform settings & dynamic pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default platform configuration (Pricing, Branding, Shipping)
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('pricing_plans', '{
        "free": { "name": "Free / Digital", "price": 0, "currency": "INR", "interval": "forever", "features": ["1 Digital Profile", "QR Code Generator", "Contact Download (vCard)", "Basic Contact Buttons"] },
        "pro": { "name": "Pro Card", "price": 1499, "currency": "INR", "interval": "one-time", "features": ["Premium NFC + QR Card", "Free Worldwide Delivery", "Live Lead Capture System", "Real-time Visitor Analytics", "Custom Themes & Branding", "vCard Instant Save"] },
        "business": { "name": "Business / Team", "price": 4999, "currency": "INR", "interval": "one-time", "features": ["5 NFC + QR Cards for Team", "Central Team Dashboard", "Centralized Lead Management", "Team-wide Analytics", "Priority Support & Dedicated Onboarding"] }
    }'::jsonb, 'Configurable SaaS plans and physical card pricing'),
    ('card_types', '[
        {"id": "matte_black", "name": "Matte Executive Black", "description": "Premium ultra-smooth matte finish with silver laser accents", "price": 1499},
        {"id": "metallic_gold", "name": "Brushed Gold Metal", "description": "Luxurious heavy metallic finish with NFC core", "price": 2499},
        {"id": "classic_white", "name": "Classic Studio White", "description": "Minimal clean white with gloss UV spot lettering", "price": 1299},
        {"id": "bamboo_wood", "name": "Eco Bamboo Wood", "description": "Sustainably sourced natural bamboo with laser-engraved QR", "price": 1899}
    ]'::jsonb, 'Physical NFC Card variants available for ordering')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. ADMIN USERS TABLE & ROLE VERIFICATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
    
    -- Social links
    linkedin TEXT,
    instagram TEXT,
    facebook TEXT,
    twitter TEXT,
    youtube TEXT,
    github TEXT,
    
    -- Design & Theme customization
    theme TEXT DEFAULT 'professional' CHECK (theme IN ('professional', 'minimal', 'modern', 'business', 'creative')),
    accent_color TEXT DEFAULT '#2563eb',
    font_family TEXT DEFAULT 'inter' CHECK (font_family IN ('inter', 'outfit', 'playfair', 'mono')),
    
    -- Additional profile metadata (Services, custom WhatsApp prompt)
    services JSONB DEFAULT '[]'::jsonb,
    custom_whatsapp_message TEXT DEFAULT 'Hi, I connected with your profile via your TapCard. Let''s connect!',
    
    -- Status and privacy
    is_public BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNLISTED', 'DISABLED')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- ------------------------------------------------------------------------------
-- 4. CARDS TABLE (Physical NFC & QR Management)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_code TEXT UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    card_type TEXT DEFAULT 'matte_black',
    design_template TEXT DEFAULT 'corporate',
    status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'PROGRAMMING', 'ACTIVE', 'SUSPENDED', 'LOST', 'REPLACED', 'DISABLED')),
    short_url TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_card_code ON public.cards(card_code);
CREATE INDEX IF NOT EXISTS idx_cards_profile_id ON public.cards(profile_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);

-- ------------------------------------------------------------------------------
-- 5. LEADS TABLE (Form Enquiry Capture)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'direct' CHECK (source IN ('nfc', 'qr', 'direct')),
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_profile_id ON public.leads(profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. ANALYTICS EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'profile_view',
        'nfc_visit',
        'qr_visit',
        'whatsapp_click',
        'call_click',
        'email_click',
        'website_click',
        'linkedin_click',
        'instagram_click',
        'contact_download',
        'lead_submit'
    )),
    source TEXT DEFAULT 'direct' CHECK (source IN ('nfc', 'qr', 'direct')),
    session_id TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON public.analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_source ON public.analytics_events(source);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. ORDERS TABLE (Physical Card Orders & Delivery Lifecycle)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    card_type TEXT NOT NULL,
    design TEXT DEFAULT 'corporate',
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    order_status TEXT DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'PAID', 'PROCESSING', 'PRINTING', 'NFC_PROGRAMMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
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

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

-- ------------------------------------------------------------------------------
-- 8. SUBSCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'BUSINESS')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC TIMESTAMP TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cards_updated_at ON public.cards;
CREATE TRIGGER set_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- APP SETTINGS RLS
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Admin write app_settings" ON public.app_settings
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ADMIN USERS RLS
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Super admin manage admin_users" ON public.admin_users
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- PROFILES RLS
-- Anyone can view public and active profiles
CREATE POLICY "Public can view active profiles" ON public.profiles
    FOR SELECT TO public USING (is_public = true AND status = 'ACTIVE');

-- Authenticated users can view their own profile even if unlisted/disabled
CREATE POLICY "Users can view own profiles" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Users can insert and update their own profiles
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- CARDS RLS
-- Public can look up card by card_code to resolve profile
CREATE POLICY "Public can lookup active cards" ON public.cards
    FOR SELECT TO public USING (true);

CREATE POLICY "Users can view assigned cards" ON public.cards
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to cards" ON public.cards
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- LEADS RLS
-- Anyone can submit a lead on a public profile
CREATE POLICY "Public can insert lead" ON public.leads
    FOR INSERT TO public WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND is_public = true AND status = 'ACTIVE')
    );

-- Profile owner can view leads for their profiles
CREATE POLICY "Users can view leads for their profiles" ON public.leads
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = leads.profile_id AND user_id = auth.uid()) 
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Users can update leads for their profiles" ON public.leads
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = leads.profile_id AND user_id = auth.uid()) 
        OR public.is_admin(auth.uid())
    );

-- ANALYTICS EVENTS RLS
-- Public can record an analytics event
CREATE POLICY "Public can insert analytics events" ON public.analytics_events
    FOR INSERT TO public WITH CHECK (true);

-- Profile owner can view their analytics events
CREATE POLICY "Users can view own profile analytics" ON public.analytics_events
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = analytics_events.profile_id AND user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

-- ORDERS RLS
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON public.orders
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- SUBSCRIPTIONS RLS
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 11. STORAGE BUCKET FOR USER IMAGES & ASSETS
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('tapcard-assets', 'tapcard-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read tapcard-assets" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'tapcard-assets');

CREATE POLICY "Allow uploads to tapcard-assets" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'tapcard-assets');

CREATE POLICY "Allow update/delete on tapcard-assets" ON storage.objects
    FOR ALL TO public USING (bucket_id = 'tapcard-assets');

