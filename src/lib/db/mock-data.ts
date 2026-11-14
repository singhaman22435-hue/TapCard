import { Profile, Card, Lead, AnalyticsEvent, Order, AppPlan } from '@/types/database';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof_01j7aman000000000000001',
    user_id: 'usr_aman_01',
    slug: 'aman',
    full_name: 'Aman Singh',
    designation: 'Founder & Full Stack Engineer',
    company: 'TapCard',
    bio: 'Building next-generation contactless networking platforms, smart NFC business cards, and scalable cloud systems.',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    email: 'singhaman22435@gmail.com',
    website: 'https://digitapcard-six.vercel.app',
    address: 'Cyber City, Phase 2',
    city: 'Gurugram',
    country: 'India',
    linkedin: 'https://linkedin.com/in/aman',
    instagram: 'https://instagram.com/aman',
    twitter: 'https://x.com/aman',
    github: 'https://github.com/singhaman22435-hue',
    theme: 'professional',
    accent_color: '#2563eb',
    font_family: 'inter',
    services: [
      {
        id: 'srv_1',
        title: 'NFC Smart Card Programming',
        description: 'Physical NFC chip encoding (NDEF URL) and cloud-synced digital profile architecture.',
        price: '₹1,499',
      },
      {
        id: 'srv_2',
        title: 'Full Stack Web & SaaS Architecture',
        description: 'End-to-end Next.js, TypeScript, and high-performance cloud development.',
        price: 'Custom',
      },
    ],
    custom_whatsapp_message: 'Hi Aman, I tapped your TapCard NFC profile and would love to connect!',
    is_public: true,
    status: 'ACTIVE',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-14T12:00:00Z',
  },
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card_01j7card000000000000001',
    card_code: 'TC-8F72KX',
    profile_id: 'prof_01j7aman000000000000001',
    user_id: 'usr_aman_01',
    card_type: 'matte_black',
    design_template: 'corporate',
    status: 'ACTIVE',
    short_url: 'https://digitapcard-six.vercel.app/c/TC-8F72KX',
    assigned_at: '2026-02-01T10:00:00Z',
    activated_at: '2026-02-01T10:30:00Z',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T10:30:00Z',
  },
  {
    id: 'card_01j7card000000000000002',
    card_code: 'TC-A7K92X',
    profile_id: 'prof_01j7aman000000000000001',
    user_id: 'usr_aman_01',
    card_type: 'metallic_gold',
    design_template: 'minimal',
    status: 'ACTIVE',
    short_url: 'https://digitapcard-six.vercel.app/c/TC-A7K92X',
    assigned_at: '2026-02-05T14:00:00Z',
    activated_at: '2026-02-05T15:30:00Z',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T15:30:00Z',
  },
];

export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_ANALYTICS: AnalyticsEvent[] = [];
export const INITIAL_ORDERS: Order[] = [];

export const DEFAULT_PLANS: AppPlan[] = [
  {
    id: 'free',
    name: 'Free / Digital',
    price: 0,
    currency: 'INR',
    interval: 'forever',
    features: [
      '1 Public Digital Profile',
      'Dynamic QR Code Generator',
      'Instant vCard Contact Download',
      'Direct WhatsApp & Call Buttons',
      'Web & Social Media Links',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Card',
    price: 1499,
    currency: 'INR',
    interval: 'one-time',
    popular: true,
    features: [
      'Physical Matte NFC + QR Card',
      'Free Express Shipping Across India',
      'Unlimited Tap & Scan Analytics',
      'Live Lead Generation & Inquiries',
      '5 Custom Professional Themes',
      'Custom WhatsApp Starter Message',
      'Lifetime Cloud Profile Hosting',
    ],
  },
  {
    id: 'business',
    name: 'Business Team',
    price: 4999,
    currency: 'INR',
    interval: 'one-time',
    features: [
      '5 Custom NFC + QR Cards for Team',
      'Centralized Team Admin Dashboard',
      'Company-wide Lead CRM',
      'Team Performance Analytics',
      'Bulk Card CSV Generator',
      'Dedicated Account Onboarding',
    ],
  },
];
