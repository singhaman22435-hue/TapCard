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
import { DEFAULT_PLANS } from './mock-data';
import { generateCardCode, getCardUrl, slugify } from '../utils';
import { createAdminClient } from '@/lib/supabase/admin';

class TapCardDatabase {
  private plans: AppPlan[] = [...DEFAULT_PLANS];

  private getSupabase() {
    return createAdminClient();
  }

  // -------------------------------------------------------------
  // PROFILES
  // -------------------------------------------------------------
  async getProfileById(id: string): Promise<Profile | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return data as Profile;
    } catch (e) {
      console.error('getProfileById error:', e);
      return null;
    }
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data as Profile;
    } catch (e) {
      console.error('getProfileByUserId error:', e);
      return null;
    }
  }

  async getProfileBySlug(slug: string): Promise<Profile | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('slug', cleanSlug)
        .single();

      if (error || !data) return null;
      return data as Profile;
    } catch (e) {
      console.error('getProfileBySlug error:', e);
      return null;
    }
  }

  async getAllProfiles(): Promise<Profile[]> {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as Profile[];
    } catch (e) {
      console.error('getAllProfiles error:', e);
      return [];
    }
  }

  async createProfile(data: Partial<Profile> & { full_name: string; user_id: string }): Promise<Profile> {
    const supabase = this.getSupabase();
    const id = data.id && data.id.includes('-') ? data.id : crypto.randomUUID();
    const baseSlug = slugify(data.slug || data.full_name);
    let uniqueSlug = baseSlug;

    // Check slug collision in Supabase
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('slug')
          .ilike('slug', `${baseSlug}%`);

        if (existing && existing.length > 0) {
          uniqueSlug = `${baseSlug}-${existing.length + 1}`;
        }
      } catch {}
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

    const cardCode = generateCardCode();
    const newCard: Card = {
      id: crypto.randomUUID(),
      card_code: cardCode,
      profile_id: newProfile.id,
      user_id: newProfile.user_id,
      card_type: 'matte_black',
      design_template: 'corporate',
      status: 'ACTIVE',
      short_url: getCardUrl(cardCode),
      assigned_at: new Date().toISOString(),
      activated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data: dbProfile, error: profErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (profErr) {
          console.error('Supabase profile insert error:', profErr);
        } else {
          await supabase.from('cards').insert(newCard);
          return dbProfile as Profile;
        }
      } catch (err) {
        console.error('Supabase createProfile error:', err);
      }
    }

    return newProfile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('updateProfile error:', error);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('updateProfile error:', e);
      return null;
    }
  }

  // -------------------------------------------------------------
  // RESOLVE PUBLIC URL (Card Code or Slug) - Item 16 Physical Card Lifecycle
  // -------------------------------------------------------------
  async resolvePublicIdentifier(identifier: string): Promise<{
    profile: Profile | null;
    card: Card | null;
    errorReason?: 'CARD_NOT_FOUND' | 'CARD_INACTIVE' | 'CARD_REPLACED' | 'CARD_UNASSIGNED' | 'PROFILE_INACTIVE';
  }> {
    const cleanId = decodeURIComponent(identifier).trim();
    const supabase = this.getSupabase();
    if (!supabase) {
      return { profile: null, card: null, errorReason: 'CARD_NOT_FOUND' };
    }

    try {
      // 1. Try card lookup in Supabase
      const { data: card } = await supabase
        .from('cards')
        .select('*')
        .ilike('card_code', cleanId)
        .single();

      if (card) {
        if (card.status === 'REPLACED') {
          return { profile: null, card: card as Card, errorReason: 'CARD_REPLACED' };
        }
        if (card.status === 'SUSPENDED' || card.status === 'DISABLED' || card.status === 'LOST') {
          return { profile: null, card: card as Card, errorReason: 'CARD_INACTIVE' };
        }
        if (card.status === 'AVAILABLE' || card.status === 'PROGRAMMING' || !card.profile_id) {
          return { profile: null, card: card as Card, errorReason: 'CARD_UNASSIGNED' };
        }

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', card.profile_id)
          .single();

        if (!prof || prof.status === 'DISABLED') {
          return { profile: null, card: card as Card, errorReason: 'PROFILE_INACTIVE' };
        }

        return { profile: prof as Profile, card: card as Card };
      }

      // 2. Try profile slug lookup in Supabase
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .ilike('slug', cleanId)
        .single();

      if (prof) {
        if (prof.status === 'DISABLED') {
          return { profile: null, card: null, errorReason: 'PROFILE_INACTIVE' };
        }

        const { data: assignedCard } = await supabase
          .from('cards')
          .select('*')
          .eq('profile_id', prof.id)
          .eq('status', 'ACTIVE')
          .limit(1)
          .single();

        return { profile: prof as Profile, card: (assignedCard as Card) || null };
      }

      return { profile: null, card: null, errorReason: 'CARD_NOT_FOUND' };
    } catch (e) {
      console.error('resolvePublicIdentifier error:', e);
      return { profile: null, card: null, errorReason: 'CARD_NOT_FOUND' };
    }
  }

  // -------------------------------------------------------------
  // CARDS MANAGEMENT
  // -------------------------------------------------------------
  async getCardById(id: string): Promise<Card | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data: card, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !card) return null;

      if (card.profile_id) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', card.profile_id).single();
        return { ...card, profile: prof || null } as Card;
      }
      return card as Card;
    } catch (e) {
      console.error('getCardById error:', e);
      return null;
    }
  }

  async getCardByCode(code: string): Promise<Card | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data: card, error } = await supabase
        .from('cards')
        .select('*')
        .ilike('card_code', code.trim())
        .single();

      if (error || !card) return null;

      if (card.profile_id) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', card.profile_id).single();
        return { ...card, profile: prof || null } as Card;
      }
      return card as Card;
    } catch (e) {
      console.error('getCardByCode error:', e);
      return null;
    }
  }

  async getCardsForProfile(profileId: string): Promise<Card[]> {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('profile_id', profileId);

      if (error || !data) return [];
      return data as Card[];
    } catch (e) {
      console.error('getCardsForProfile error:', e);
      return [];
    }
  }

  async getCardsForUser(userId: string): Promise<Card[]> {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as Card[];
    } catch (e) {
      console.error('getCardsForUser error:', e);
      return [];
    }
  }

  async getAllCards(filter?: { status?: string; search?: string }): Promise<Card[]> {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase.from('cards').select('*').order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'ALL') {
        query = query.eq('status', filter.status);
      }

      if (filter?.search) {
        query = query.or(`card_code.ilike.%${filter.search}%,card_type.ilike.%${filter.search}%`);
      }

      const { data: cards, error } = await query;
      if (error || !cards) return [];

      // Fetch profiles to populate details
      const profileIds = cards.map((c) => c.profile_id).filter(Boolean);
      let profilesMap: Record<string, Profile> = {};

      if (profileIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('*').in('id', profileIds);
        if (profs) {
          profilesMap = Object.fromEntries(profs.map((p) => [p.id, p]));
        }
      }

      return cards.map((c) => ({
        ...c,
        profile: c.profile_id ? profilesMap[c.profile_id] || null : null,
      })) as Card[];
    } catch (e) {
      console.error('getAllCards error:', e);
      return [];
    }
  }

  async createCard(data: Partial<Card> & { card_type?: CardType }): Promise<Card> {
    const supabase = this.getSupabase();
    const cardCode = data.card_code || generateCardCode('TC');
    const id = data.id && data.id.includes('-') ? data.id : crypto.randomUUID();

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

    if (supabase) {
      try {
        const { data: created, error } = await supabase.from('cards').insert(newCard).select().single();
        if (!error && created) {
          return created as Card;
        }
      } catch (e) {
        console.error('createCard error:', e);
      }
    }

    return newCard;
  }

  async bulkGenerateCards(count: number, cardType: CardType = 'matte_black'): Promise<Card[]> {
    const cardsToInsert: Card[] = [];
    for (let i = 0; i < count; i++) {
      const cardCode = generateCardCode('TC');
      const id = crypto.randomUUID();
      cardsToInsert.push({
        id,
        card_code: cardCode,
        profile_id: null,
        user_id: null,
        card_type: cardType,
        design_template: 'corporate',
        status: 'AVAILABLE',
        short_url: getCardUrl(cardCode),
        assigned_at: null,
        activated_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('cards').insert(cardsToInsert).select();
        if (!error && data) {
          return data as Card[];
        }
      } catch (e) {
        console.error('bulkGenerateCards error:', e);
      }
    }

    return cardsToInsert;
  }

  async assignCard(cardId: string, profileId: string, userId: string): Promise<Card | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('cards')
        .update({
          profile_id: profileId,
          user_id: userId,
          status: 'ASSIGNED',
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error || !data) return null;
      return data as Card;
    } catch (e) {
      console.error('assignCard error:', e);
      return null;
    }
  }

  async activateCard(cardId: string): Promise<Card | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('cards')
        .update({
          status: 'ACTIVE',
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error || !data) return null;
      return data as Card;
    } catch (e) {
      console.error('activateCard error:', e);
      return null;
    }
  }

  async updateCardStatus(cardId: string, status: CardStatus): Promise<Card | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('cards')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error || !data) return null;
      return data as Card;
    } catch (e) {
      console.error('updateCardStatus error:', e);
      return null;
    }
  }

  async replaceCard(oldCardId: string, newCardId: string): Promise<{ oldCard: Card; newCard: Card }> {
    const supabase = this.getSupabase();
    if (!supabase) throw new Error('Database connection unavailable');

    const { data: oldCard } = await supabase.from('cards').select('*').eq('id', oldCardId).single();
    if (!oldCard || !oldCard.profile_id) {
      throw new Error('Old card does not exist or has no assigned profile.');
    }

    // 1. Mark old card as REPLACED (decommissioned)
    const { data: updatedOld } = await supabase
      .from('cards')
      .update({ status: 'REPLACED', updated_at: new Date().toISOString() })
      .eq('id', oldCardId)
      .select()
      .single();

    // 2. Transfer profile link to new card and activate it
    const { data: updatedNew } = await supabase
      .from('cards')
      .update({
        profile_id: oldCard.profile_id,
        user_id: oldCard.user_id,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString(),
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', newCardId)
      .select()
      .single();

    return {
      oldCard: updatedOld as Card,
      newCard: updatedNew as Card,
    };
  }

  // -------------------------------------------------------------
  // LEADS
  // -------------------------------------------------------------
  async getLeads(profileId?: string): Promise<Lead[]> {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as Lead[];
    } catch (e) {
      console.error('getLeads error:', e);
      return [];
    }
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
    const supabase = this.getSupabase();
    const id = crypto.randomUUID();
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

    if (supabase) {
      try {
        const { data: created, error } = await supabase.from('leads').insert(newLead).select().single();
        if (!error && created) {
          return created as Lead;
        }
      } catch (e) {
        console.error('createLead error:', e);
      }
    }

    return newLead;
  }

  async updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<Lead | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const updateData: any = { status };
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) return null;
      return data as Lead;
    } catch (e) {
      console.error('updateLeadStatus error:', e);
      return null;
    }
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
    const supabase = this.getSupabase();
    const id = crypto.randomUUID();
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

    if (supabase) {
      try {
        await supabase.from('analytics_events').insert(newEvent);
      } catch (e) {
        console.error('recordAnalyticsEvent error:', e);
      }
    }

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
    const supabase = this.getSupabase();
    if (!supabase) {
      return {
        totalViews: 0,
        nfcTaps: 0,
        qrScans: 0,
        directVisits: 0,
        ctaClicks: 0,
        whatsappClicks: 0,
        callClicks: 0,
        contactDownloads: 0,
        totalLeads: 0,
        conversionRate: 0,
      };
    }

    try {
      let eventsQuery = supabase.from('analytics_events').select('event_type, source');
      let leadsQuery = supabase.from('leads').select('id', { count: 'exact', head: true });

      if (profileId) {
        eventsQuery = eventsQuery.eq('profile_id', profileId);
        leadsQuery = leadsQuery.eq('profile_id', profileId);
      }

      const [{ data: events }, { count: totalLeads }] = await Promise.all([eventsQuery, leadsQuery]);
      const eventList = events || [];

      const totalViews = eventList.filter((e) => e.event_type === 'profile_view').length;
      const nfcTaps = eventList.filter((e) => e.event_type === 'nfc_visit' || e.source === 'nfc').length;
      const qrScans = eventList.filter((e) => e.event_type === 'qr_visit' || e.source === 'qr').length;
      const directVisits = eventList.filter((e) => e.source === 'direct' && e.event_type === 'profile_view').length;

      const whatsappClicks = eventList.filter((e) => e.event_type === 'whatsapp_click').length;
      const callClicks = eventList.filter((e) => e.event_type === 'call_click').length;
      const contactDownloads = eventList.filter((e) => e.event_type === 'contact_download').length;
      const ctaClicks = eventList.filter((e) =>
        ['whatsapp_click', 'call_click', 'email_click', 'website_click', 'contact_download', 'linkedin_click'].includes(e.event_type)
      ).length;

      const leadsCount = totalLeads || 0;
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
    } catch (e) {
      console.error('getAnalyticsSummary error:', e);
      return {
        totalViews: 0,
        nfcTaps: 0,
        qrScans: 0,
        directVisits: 0,
        ctaClicks: 0,
        whatsappClicks: 0,
        callClicks: 0,
        contactDownloads: 0,
        totalLeads: 0,
        conversionRate: 0,
      };
    }
  }

  async getAnalyticsDailyTimeline(profileId?: string, days: number = 7): Promise<Array<{
    date: string;
    views: number;
    nfc: number;
    qr: number;
    leads: number;
  }>> {
    const supabase = this.getSupabase();
    const result: Array<{ date: string; views: number; nfc: number; qr: number; leads: number }> = [];
    const now = new Date();

    if (!supabase) return result;

    try {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      const startIso = startDate.toISOString();

      let eventsQuery = supabase
        .from('analytics_events')
        .select('event_type, source, created_at')
        .gte('created_at', startIso);

      let leadsQuery = supabase
        .from('leads')
        .select('created_at')
        .gte('created_at', startIso);

      if (profileId) {
        eventsQuery = eventsQuery.eq('profile_id', profileId);
        leadsQuery = leadsQuery.eq('profile_id', profileId);
      }

      const [{ data: events }, { data: leads }] = await Promise.all([eventsQuery, leadsQuery]);
      const eventList = events || [];
      const leadList = leads || [];

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayEvents = eventList.filter((e) => e.created_at.startsWith(dateStr));
        const dayLeads = leadList.filter((l) => l.created_at.startsWith(dateStr));

        result.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: dayEvents.filter((e) => e.event_type === 'profile_view').length,
          nfc: dayEvents.filter((e) => e.source === 'nfc').length,
          qr: dayEvents.filter((e) => e.source === 'qr').length,
          leads: dayLeads.length,
        });
      }

      return result;
    } catch (e) {
      console.error('getAnalyticsDailyTimeline error:', e);
      return result;
    }
  }

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  async getOrders(userId?: string): Promise<Order[]> {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as Order[];
    } catch (e) {
      console.error('getOrders error:', e);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error || !data) return null;
      return data as Order;
    } catch (e) {
      console.error('getOrderById error:', e);
      return null;
    }
  }

  async createOrder(data: {
    user_id: string;
    profile_id?: string | null;
    quantity: number;
    card_type: CardType;
    design?: string;
    amount: number;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_pincode: string;
  }): Promise<Order> {
    const supabase = this.getSupabase();
    const orderNumber = `TC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const id = crypto.randomUUID();

    const newOrder: Order = {
      id,
      order_number: orderNumber,
      user_id: data.user_id,
      profile_id: data.profile_id || null,
      card_id: null,
      quantity: data.quantity,
      card_type: data.card_type,
      design: (data.design as any) || 'corporate',
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

    if (supabase) {
      try {
        const { data: created, error } = await supabase.from('orders').insert(newOrder).select().single();
        if (!error && created) {
          return created as Order;
        }
      } catch (e) {
        console.error('createOrder error:', e);
      }
    }

    return newOrder;
  }

  async updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus?: OrderPaymentStatus,
    trackingNumber?: string
  ): Promise<Order | null> {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const updateData: any = {
        order_status: orderStatus,
        updated_at: new Date().toISOString(),
      };
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error || !data) return null;
      return data as Order;
    } catch (e) {
      console.error('updateOrderStatus error:', e);
      return null;
    }
  }

  // -------------------------------------------------------------
  // SETTINGS & PRICING
  // -------------------------------------------------------------
  async getPlans(): Promise<AppPlan[]> {
    return this.plans;
  }

  async updatePlan(planId: string, updates: Partial<AppPlan>): Promise<AppPlan | null> {
    const index = this.plans.findIndex((p) => p.id === planId);
    if (index === -1) return null;
    this.plans[index] = { ...this.plans[index], ...updates };
    return this.plans[index];
  }
}

export const repo = new TapCardDatabase();
