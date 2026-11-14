import { Profile, Card, Lead, AnalyticsEvent, Order, AppPlan } from '@/types/database';

export const INITIAL_PROFILES: Profile[] = [];
export const INITIAL_CARDS: Card[] = [];
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
