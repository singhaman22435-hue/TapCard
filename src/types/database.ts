export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileTheme = 'professional' | 'minimal' | 'modern' | 'business' | 'creative';
export type ProfileFont = 'inter' | 'outfit' | 'playfair' | 'mono';
export type ProfileStatus = 'ACTIVE' | 'UNLISTED' | 'DISABLED';

export type CardStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'PROGRAMMING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'LOST'
  | 'REPLACED'
  | 'DISABLED';

export type CardType = 'matte_black' | 'metallic_gold' | 'classic_white' | 'bamboo_wood';
export type CardDesignTemplate = 'minimal' | 'corporate' | 'modern' | 'elegant' | 'creative';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
export type VisitSource = 'nfc' | 'qr' | 'direct';

export type AnalyticsEventType =
  | 'profile_view'
  | 'nfc_visit'
  | 'qr_visit'
  | 'whatsapp_click'
  | 'call_click'
  | 'email_click'
  | 'website_click'
  | 'linkedin_click'
  | 'instagram_click'
  | 'contact_download'
  | 'lead_submit';

export type OrderPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'PRINTING'
  | 'NFC_PROGRAMMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  designation?: string | null;
  company?: string | null;
  bio?: string | null;
  profile_photo?: string | null;
  cover_image?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  
  // Social links
  linkedin?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  github?: string | null;

  // Design tokens & options
  theme: ProfileTheme;
  accent_color: string;
  font_family: ProfileFont;

  services?: ServiceItem[];
  custom_whatsapp_message?: string | null;

  is_public: boolean;
  status: ProfileStatus;

  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  card_code: string;
  profile_id?: string | null;
  user_id?: string | null;
  card_type: CardType;
  design_template: CardDesignTemplate;
  status: CardStatus;
  short_url?: string | null;
  assigned_at?: string | null;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

export interface Lead {
  id: string;
  profile_id: string;
  card_id?: string | null;
  name: string;
  phone?: string | null;
  email: string;
  message?: string | null;
  source: VisitSource;
  status: LeadStatus;
  notes?: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  profile_id: string;
  card_id?: string | null;
  event_type: AnalyticsEventType;
  source: VisitSource;
  session_id?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  profile_id?: string | null;
  card_id?: string | null;
  quantity: number;
  card_type: CardType;
  design: CardDesignTemplate;
  amount: number;
  currency: string;
  payment_status: OrderPaymentStatus;
  order_status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  tracking_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'operator';
  created_at: string;
  email?: string;
}

export interface AppPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}
