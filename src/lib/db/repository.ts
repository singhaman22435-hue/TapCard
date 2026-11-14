import {
  Profile,
  Card,
  Lead,
  AnalyticsEvent,
  Order,
  CardStatus,
  LeadStatus,
  OrderStatus,
  OrderPaymentStatus,
  VisitSource,
  AnalyticsEventType,
  CardType,
  AppPlan,
} from '@/types/database';
import {
  INITIAL_PROFILES,
  INITIAL_CARDS,
  INITIAL_LEADS,
  INITIAL_ANALYTICS,
  INITIAL_ORDERS,
  DEFAULT_PLANS,
} from './mock-data';
import { generateCardCode, getCardUrl, slugify } from '../utils';

// Global in-memory / persistent cache for runtime state
class TapCardDatabase {
  private profiles: Profile[] = [...INITIAL_PROFILES];
  private cards: Card[] = [...INITIAL_CARDS];
  private leads: Lead[] = [...INITIAL_LEADS];
  private analytics: AnalyticsEvent[] = [...INITIAL_ANALYTICS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private plans: AppPlan[] = [...DEFAULT_PLANS];

  // -------------------------------------------------------------
  // PROFILES
  // -------------------------------------------------------------
  async getProfileById(id: string): Promise<Profile | null> {
    const prof = this.profiles.find((p) => p.id === id);
    return prof ? { ...prof } : null;
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const prof = this.profiles.find((p) => p.user_id === userId);
    return prof ? { ...prof } : null;
  }

  async getProfileBySlug(slug: string): Promise<Profile | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const prof = this.profiles.find((p) => p.slug.toLowerCase() === cleanSlug);
    return prof ? { ...prof } : null;
  }

  async getAllProfiles(): Promise<Profile[]> {
    return [...this.profiles];
  }

  async createProfile(data: Partial<Profile> & { full_name: string; user_id: string }): Promise<Profile> {
    const id = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const baseSlug = slugify(data.slug || data.full_name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (this.profiles.some((p) => p.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const newProfile: Profile = {
      id,
      user_id: data.user_id,
      slug: uniqueSlug,
      full_name: data.full_name,
      designation: data.designation || '',
      company: data.company || '',
      bio: data.bio || '',
      profile_photo: data.profile_photo || null,
      cover_image: data.cover_image || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || data.phone || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || 'India',
      linkedin: data.linkedin || null,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      twitter: data.twitter || null,
      youtube: data.youtube || null,
      github: data.github || null,
      theme: data.theme || 'professional',
      accent_color: data.accent_color || '#2563eb',
      font_family: data.font_family || 'inter',
      services: data.services || [],
      custom_whatsapp_message:
        data.custom_whatsapp_message ||
        `Hi ${data.full_name}, I saw your TapCard and would love to connect!`,
      is_public: data.is_public ?? true,
      status: data.status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.profiles.push(newProfile);
    return { ...newProfile };
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const index = this.profiles.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = this.profiles[index];
    const updated: Profile = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.profiles[index] = updated;
    return { ...updated };
  }

  // -------------------------------------------------------------
  // RESOLVE PUBLIC URL (Card Code or Slug)
  // -------------------------------------------------------------
  async resolvePublicIdentifier(identifier: string): Promise<{
    profile: Profile | null;
    card: Card | null;
    errorReason?: 'CARD_NOT_FOUND' | 'CARD_INACTIVE' | 'CARD_REPLACED' | 'CARD_UNASSIGNED' | 'PROFILE_INACTIVE';
  }> {
    const cleanId = decodeURIComponent(identifier).trim();

    // 1. First check if it matches a card code (case-insensitive)
    const card = this.cards.find(
      (c) => c.card_code.toLowerCase() === cleanId.toLowerCase()
    );

    if (card) {
      if (card.status === 'REPLACED') {
        return { profile: null, card, errorReason: 'CARD_REPLACED' };
      }
      if (card.status === 'SUSPENDED' || card.status === 'DISABLED' || card.status === 'LOST') {
        return { profile: null, card, errorReason: 'CARD_INACTIVE' };
      }
      if (card.status === 'AVAILABLE' || !card.profile_id) {
        return { profile: null, card, errorReason: 'CARD_UNASSIGNED' };
      }

      // Card is assigned or active, lookup profile
      const profile = await this.getProfileById(card.profile_id);
      if (!profile || profile.status === 'DISABLED') {
        return { profile: null, card, errorReason: 'PROFILE_INACTIVE' };
      }

      return { profile, card };
    }

    // 2. If no card matches, check profile slug
    const profile = await this.getProfileBySlug(cleanId);
    if (profile) {
      if (profile.status === 'DISABLED') {
        return { profile: null, card: null, errorReason: 'PROFILE_INACTIVE' };
      }
      // Check if user has an active card
      const assignedCard = this.cards.find((c) => c.profile_id === profile.id && c.status === 'ACTIVE') || null;
      return { profile, card: assignedCard };
    }

    return { profile: null, card: null, errorReason: 'CARD_NOT_FOUND' };
  }

  // -------------------------------------------------------------
  // CARDS MANAGEMENT
  // -------------------------------------------------------------
  async getCardById(id: string): Promise<Card | null> {
    const card = this.cards.find((c) => c.id === id);
    if (!card) return null;
    const profile = card.profile_id ? await this.getProfileById(card.profile_id) : null;
    return { ...card, profile };
  }

  async getCardByCode(code: string): Promise<Card | null> {
    const card = this.cards.find((c) => c.card_code.toLowerCase() === code.toLowerCase());
    if (!card) return null;
    const profile = card.profile_id ? await this.getProfileById(card.profile_id) : null;
    return { ...card, profile };
  }

  async getCardsForProfile(profileId: string): Promise<Card[]> {
    return this.cards.filter((c) => c.profile_id === profileId);
  }

  async getCardsForUser(userId: string): Promise<Card[]> {
    return this.cards.filter((c) => c.user_id === userId);
  }

  async getAllCards(filter?: { status?: string; search?: string }): Promise<Card[]> {
    let result = [...this.cards];

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((c) => c.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.card_code.toLowerCase().includes(q) ||
          c.card_type.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)
      );
    }

    // Populate profile details
    return result.map((c) => {
      const prof = c.profile_id ? this.profiles.find((p) => p.id === c.profile_id) : null;
      return { ...c, profile: prof || null };
    });
  }

  async createCard(data: Partial<Card> & { card_type?: CardType }): Promise<Card> {
    const cardCode = data.card_code || generateCardCode('TC');
    const id = `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCard: Card = {
      id,
      card_code: cardCode,
      profile_id: data.profile_id || null,
      user_id: data.user_id || null,
      card_type: (data.card_type as CardType) || 'matte_black',
      design_template: data.design_template || 'corporate',
      status: (data.status as CardStatus) || 'AVAILABLE',
      short_url: getCardUrl(cardCode),
      assigned_at: data.profile_id ? new Date().toISOString() : null,
      activated_at: data.status === 'ACTIVE' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.cards.push(newCard);
    return { ...newCard };
  }

  async bulkGenerateCards(count: number, cardType: CardType = 'matte_black'): Promise<Card[]> {
    const generated: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = await this.createCard({ card_type: cardType, status: 'AVAILABLE' });
      generated.push(card);
    }
    return generated;
  }

  async assignCard(cardId: string, profileId: string, userId: string): Promise<Card | null> {
    const index = this.cards.findIndex((c) => c.id === cardId);
    if (index === -1) return null;

    this.cards[index] = {
      ...this.cards[index],
      profile_id: profileId,
      user_id: userId,
      status: 'ASSIGNED',
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { ...this.cards[index] };
  }

  async activateCard(cardId: string): Promise<Card | null> {
    const index = this.cards.findIndex((c) => c.id === cardId);
    if (index === -1) return null;

    const card = this.cards[index];
    if (!card.profile_id) {
      throw new Error('Card must be assigned to a profile before activation.');
    }

    this.cards[index] = {
      ...card,
      status: 'ACTIVE',
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { ...this.cards[index] };
  }

  async updateCardStatus(cardId: string, status: CardStatus): Promise<Card | null> {
    const index = this.cards.findIndex((c) => c.id === cardId);
    if (index === -1) return null;

    this.cards[index] = {
      ...this.cards[index],
      status,
      updated_at: new Date().toISOString(),
    };

    return { ...this.cards[index] };
  }

  async replaceCard(oldCardId: string, newCardId: string): Promise<{ oldCard: Card; newCard: Card }> {
    const oldIndex = this.cards.findIndex((c) => c.id === oldCardId);
    const newIndex = this.cards.findIndex((c) => c.id === newCardId);

    if (oldIndex === -1 || newIndex === -1) {
      throw new Error('Invalid card IDs provided for replacement');
    }

    const oldCard = this.cards[oldIndex];
    const profileId = oldCard.profile_id;
    const userId = oldCard.user_id;

    if (!profileId) {
      throw new Error('Old card does not have an assigned profile.');
    }

    // Disable old card
    this.cards[oldIndex] = {
      ...oldCard,
      status: 'REPLACED',
      updated_at: new Date().toISOString(),
    };

    // Activate new card pointing to the same profile
    this.cards[newIndex] = {
      ...this.cards[newIndex],
      profile_id: profileId,
      user_id: userId,
      status: 'ACTIVE',
      assigned_at: new Date().toISOString(),
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      oldCard: { ...this.cards[oldIndex] },
      newCard: { ...this.cards[newIndex] },
    };
  }

  // -------------------------------------------------------------
  // LEADS
  // -------------------------------------------------------------
  async getLeads(profileId?: string): Promise<Lead[]> {
    if (profileId) {
      return this.leads
        .filter((l) => l.profile_id === profileId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createLead(data: {
    profile_id: string;
    card_id?: string | null;
    name: string;
    email: string;
    phone?: string | null;
    message?: string | null;
    source: VisitSource;
  }): Promise<Lead> {
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLead: Lead = {
      id,
      profile_id: data.profile_id,
      card_id: data.card_id || null,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      source: data.source || 'direct',
      status: 'NEW',
      notes: null,
      created_at: new Date().toISOString(),
    };

    this.leads.unshift(newLead);
    return { ...newLead };
  }

  async updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<Lead | null> {
    const index = this.leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    this.leads[index] = {
      ...this.leads[index],
      status,
      notes: notes !== undefined ? notes : this.leads[index].notes,
    };

    return { ...this.leads[index] };
  }

  // -------------------------------------------------------------
  // ANALYTICS
  // -------------------------------------------------------------
  async recordAnalyticsEvent(event: {
    profile_id: string;
    card_id?: string | null;
    event_type: AnalyticsEventType;
    source: VisitSource;
    session_id?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AnalyticsEvent> {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEvent: AnalyticsEvent = {
      id,
      profile_id: event.profile_id,
      card_id: event.card_id || null,
      event_type: event.event_type,
      source: event.source,
      session_id: event.session_id || null,
      metadata: event.metadata || {},
      created_at: new Date().toISOString(),
    };

    this.analytics.push(newEvent);
    return newEvent;
  }

  async getAnalyticsSummary(profileId?: string): Promise<{
    totalViews: number;
    nfcTaps: number;
    qrScans: number;
    directVisits: number;
    ctaClicks: number;
    whatsappClicks: number;
    callClicks: number;
    contactDownloads: number;
    totalLeads: number;
    conversionRate: number;
  }> {
    const events = profileId
      ? this.analytics.filter((e) => e.profile_id === profileId)
      : this.analytics;

    const leadsCount = profileId
      ? this.leads.filter((l) => l.profile_id === profileId).length
      : this.leads.length;

    const totalViews = events.filter((e) => e.event_type === 'profile_view').length;
    const nfcTaps = events.filter((e) => e.event_type === 'nfc_visit' || e.source === 'nfc').length;
    const qrScans = events.filter((e) => e.event_type === 'qr_visit' || e.source === 'qr').length;
    const directVisits = events.filter((e) => e.source === 'direct' && e.event_type === 'profile_view').length;

    const whatsappClicks = events.filter((e) => e.event_type === 'whatsapp_click').length;
    const callClicks = events.filter((e) => e.event_type === 'call_click').length;
    const contactDownloads = events.filter((e) => e.event_type === 'contact_download').length;
    const ctaClicks = events.filter((e) =>
      ['whatsapp_click', 'call_click', 'email_click', 'website_click', 'contact_download', 'linkedin_click'].includes(e.event_type)
    ).length;

    const conversionRate = totalViews > 0 ? Number(((leadsCount / totalViews) * 100).toFixed(1)) : 0;

    return {
      totalViews,
      nfcTaps,
      qrScans,
      directVisits,
      ctaClicks,
      whatsappClicks,
      callClicks,
      contactDownloads,
      totalLeads: leadsCount,
      conversionRate,
    };
  }

  async getAnalyticsDailyTimeline(profileId?: string, days: number = 7): Promise<Array<{
    date: string;
    views: number;
    nfc: number;
    qr: number;
    leads: number;
  }>> {
    const result: Array<{ date: string; views: number; nfc: number; qr: number; leads: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayEvents = this.analytics.filter((e) => {
        const matchesProfile = !profileId || e.profile_id === profileId;
        return matchesProfile && e.created_at.startsWith(dateStr);
      });

      const dayLeads = this.leads.filter((l) => {
        const matchesProfile = !profileId || l.profile_id === profileId;
        return matchesProfile && l.created_at.startsWith(dateStr);
      });

      result.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: dayEvents.filter((e) => e.event_type === 'profile_view').length,
        nfc: dayEvents.filter((e) => e.source === 'nfc').length,
        qr: dayEvents.filter((e) => e.source === 'qr').length,
        leads: dayLeads.length,
      });
    }

    return result;
  }

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  async getOrders(userId?: string): Promise<Order[]> {
    let list = [...this.orders];
    if (userId) {
      list = list.filter((o) => o.user_id === userId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createOrder(data: {
    user_id: string;
    profile_id?: string | null;
    quantity: number;
    card_type: CardType;
    design: Card['design_template'];
    amount: number;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_pincode: string;
  }): Promise<Order> {
    const orderNumber = `TC-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newOrder: Order = {
      id,
      order_number: orderNumber,
      user_id: data.user_id,
      profile_id: data.profile_id || null,
      card_id: null,
      quantity: data.quantity || 1,
      card_type: data.card_type,
      design: data.design,
      amount: data.amount,
      currency: 'INR',
      payment_status: 'PENDING',
      order_status: 'PENDING',
      shipping_name: data.shipping_name,
      shipping_phone: data.shipping_phone,
      shipping_address: data.shipping_address,
      shipping_city: data.shipping_city,
      shipping_state: data.shipping_state,
      shipping_pincode: data.shipping_pincode,
      tracking_number: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return { ...newOrder };
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: OrderPaymentStatus,
    trackingNumber?: string
  ): Promise<Order | null> {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      order_status: status,
      payment_status: paymentStatus || this.orders[index].payment_status,
      tracking_number: trackingNumber || this.orders[index].tracking_number,
      updated_at: new Date().toISOString(),
    };

    return { ...this.orders[index] };
  }

  // -------------------------------------------------------------
  // APP SETTINGS & PRICING
  // -------------------------------------------------------------
  async getPlans(): Promise<AppPlan[]> {
    return [...this.plans];
  }

  async updatePlan(id: string, updates: Partial<AppPlan>): Promise<AppPlan | null> {
    const index = this.plans.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.plans[index] = { ...this.plans[index], ...updates };
    return { ...this.plans[index] };
  }
}

// Global singleton instance
const globalForRepo = global as unknown as { tapCardRepo: TapCardDatabase };
export const repo = globalForRepo.tapCardRepo || new TapCardDatabase();
if (process.env.NODE_ENV !== 'production') globalForRepo.tapCardRepo = repo;

