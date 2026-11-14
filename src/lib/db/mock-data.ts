import { Profile, Card, Lead, AnalyticsEvent, Order, AppPlan } from '@/types/database';

export const DEMO_USER_ID = 'usr_01j7tapcarddemo000000001';
export const ADMIN_USER_ID = 'usr_01j7adminmaster000000001';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof_01j7aman000000000000001',
    user_id: DEMO_USER_ID,
    slug: 'aman-singh',
    full_name: 'Aman Singh',
    designation: 'Senior Full Stack & AI Systems Engineer',
    company: 'Nexus Technologies',
    bio: 'Architecting scalable cloud backends, modern responsive web applications, and autonomous digital identity infrastructure.',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    email: 'aman.singh@nexustech.io',
    website: 'https://nexustech.io',
    address: 'DLF Cyber City, Sector 24',
    city: 'Gurugram',
    country: 'India',
    linkedin: 'https://linkedin.com/in/amansingh-dev',
    instagram: 'https://instagram.com/aman.dev',
    facebook: '',
    twitter: 'https://twitter.com/aman_builder',
    youtube: '',
    github: 'https://github.com/aman-nexus',
    theme: 'professional',
    accent_color: '#2563eb',
    font_family: 'inter',
    services: [
      { id: '1', title: 'Enterprise Web Development', description: 'Next.js & TypeScript production platforms with high reliability', price: '₹75,000+' },
      { id: '2', title: 'NFC & IoT Hardware Integrations', description: 'Custom NDEF firmware, smart cards, and tap-to-connect systems', price: '₹45,000+' },
      { id: '3', title: 'Cloud Database Architecture', description: 'Supabase, PostgreSQL, RLS policies, and high-load caching', price: '₹50,000+' }
    ],
    custom_whatsapp_message: "Hi Aman, I just tapped your TapCard! I'd love to connect with you regarding a project.",
    is_public: true,
    status: 'ACTIVE',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-14T08:30:00Z',
  }
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card_01j7card000000000000001',
    card_code: 'TC-8F72KX',
    profile_id: 'prof_01j7aman000000000000001',
    user_id: DEMO_USER_ID,
    card_type: 'matte_black',
    design_template: 'corporate',
    status: 'ACTIVE',
    short_url: 'https://tapcard.in/c/TC-8F72KX',
    assigned_at: '2026-02-02T11:00:00Z',
    activated_at: '2026-02-02T12:00:00Z',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-02T12:00:00Z',
  },
  {
    id: 'card_01j7card000000000000002',
    card_code: 'TC-A7K92X',
    profile_id: 'prof_01j7aman000000000000001',
    user_id: DEMO_USER_ID,
    card_type: 'metallic_gold',
    design_template: 'minimal',
    status: 'ACTIVE',
    short_url: 'https://tapcard.in/c/TC-A7K92X',
    assigned_at: '2026-02-05T14:00:00Z',
    activated_at: '2026-02-05T15:30:00Z',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T15:30:00Z',
  },
  {
    id: 'card_01j7card000000000000003',
    card_code: 'TC-99B4ZZ',
    profile_id: null,
    user_id: null,
    card_type: 'classic_white',
    design_template: 'modern',
    status: 'AVAILABLE',
    short_url: 'https://tapcard.in/c/TC-99B4ZZ',
    assigned_at: null,
    activated_at: null,
    created_at: '2026-02-10T08:00:00Z',
    updated_at: '2026-02-10T08:00:00Z',
  },
  {
    id: 'card_01j7card000000000000004',
    card_code: 'TC-B77M1Q',
    profile_id: null,
    user_id: null,
    card_type: 'bamboo_wood',
    design_template: 'creative',
    status: 'AVAILABLE',
    short_url: 'https://tapcard.in/c/TC-B77M1Q',
    assigned_at: null,
    activated_at: null,
    created_at: '2026-02-10T08:05:00Z',
    updated_at: '2026-02-10T08:05:00Z',
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead_01',
    profile_id: 'prof_01j7aman000000000000001',
    card_id: 'card_01j7card000000000000001',
    name: 'Vikram Malhotra',
    phone: '+919811223344',
    email: 'vikram@horizoncapital.in',
    message: 'Hello Aman, loved your NFC card at the FinTech Summit! We want to discuss building an AI-powered portal for our wealth advisory.',
    source: 'nfc',
    status: 'CONTACTED',
    notes: 'Scheduled discovery call for Monday 3 PM',
    created_at: '2026-02-12T14:20:00Z',
  },
  {
    id: 'lead_02',
    profile_id: 'prof_01j7aman000000000000001',
    card_id: 'card_01j7card000000000000001',
    name: 'Pooja Sharma',
    phone: '+919922334455',
    email: 'pooja.s@stellarbrands.com',
    message: 'Interested in ordering 25 NFC cards for our leadership team and integrating with our custom brand domains.',
    source: 'qr',
    status: 'NEW',
    notes: 'Send corporate team plan details and rate card',
    created_at: '2026-02-13T10:15:00Z',
  }
];

export const INITIAL_ANALYTICS: AnalyticsEvent[] = [
  { id: 'evt_1', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'nfc_visit', source: 'nfc', created_at: '2026-02-12T14:15:00Z' },
  { id: 'evt_2', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'profile_view', source: 'nfc', created_at: '2026-02-12T14:15:05Z' },
  { id: 'evt_3', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'whatsapp_click', source: 'nfc', created_at: '2026-02-12T14:16:00Z' },
  { id: 'evt_4', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'contact_download', source: 'nfc', created_at: '2026-02-12T14:17:30Z' },
  { id: 'evt_5', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'qr_visit', source: 'qr', created_at: '2026-02-13T10:10:00Z' },
  { id: 'evt_6', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'profile_view', source: 'qr', created_at: '2026-02-13T10:10:02Z' },
  { id: 'evt_7', profile_id: 'prof_01j7aman000000000000001', card_id: 'card_01j7card000000000000001', event_type: 'lead_submit', source: 'qr', created_at: '2026-02-13T10:15:00Z' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_01j7ord000000000000001',
    order_number: 'TC-ORD-10821',
    user_id: DEMO_USER_ID,
    profile_id: 'prof_01j7aman000000000000001',
    card_id: 'card_01j7card000000000000001',
    quantity: 1,
    card_type: 'matte_black',
    design: 'corporate',
    amount: 1499,
    currency: 'INR',
    payment_status: 'PAID',
    order_status: 'DELIVERED',
    shipping_name: 'Aman Singh',
    shipping_phone: '+919876543210',
    shipping_address: 'Flat 402, Tower B, Cyber City Apartments',
    shipping_city: 'Gurugram',
    shipping_state: 'Haryana',
    shipping_pincode: '122002',
    tracking_number: 'BLUEDART-88291039',
    notes: 'Programmed with URL https://tapcard.in/c/TC-8F72KX',
    created_at: '2026-02-01T10:30:00Z',
    updated_at: '2026-02-04T16:00:00Z',
  }
];

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
      'Web & Social Media Links'
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
      'Lifetime Cloud Profile Hosting'
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
      'Dedicated Account Onboarding'
    ],
  }
];
