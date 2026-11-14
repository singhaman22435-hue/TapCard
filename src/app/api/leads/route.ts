import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { user, isAdmin } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (profileId) {
      // Check ownership
      const profile = await repo.getProfileById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      if (profile.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Cannot view leads for another user profile' }, { status: 403 });
      }

      const leads = await repo.getLeads(profileId);
      return NextResponse.json({ leads });
    }

    // Viewing all platform leads requires administrative access
    if (!isAdmin) {
      // Return leads for all profiles owned by this user
      const userProfile = await repo.getProfileByUserId(user.id);
      if (!userProfile) {
        return NextResponse.json({ leads: [] });
      }
      const leads = await repo.getLeads(userProfile.id);
      return NextResponse.json({ leads });
    }

    const leads = await repo.getLeads();
    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error('API Leads GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit lead submissions per IP to prevent spamming card owners
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`lead_${ip}`, { intervalMs: 10 * 60_000, maxRequests: 5 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a few minutes before submitting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { profile_id, card_id, name, email, phone, message, source } = body;

    if (!profile_id || !name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and target profile are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const lead = await repo.createLead({
      profile_id,
      card_id: card_id || null,
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 120),
      phone: phone ? phone.trim().slice(0, 25) : null,
      message: message ? message.trim().slice(0, 500) : null,
      source: source === 'nfc' || source === 'qr' ? source : 'direct',
    });

    // Record analytics event for lead submission
    await repo.recordAnalyticsEvent({
      profile_id,
      card_id: card_id || null,
      event_type: 'lead_submit',
      source: source || 'direct',
      metadata: { lead_id: lead.id, name: lead.name },
    });

    return NextResponse.json(
      { success: true, message: 'Contact details shared successfully.', lead },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Leads POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit enquiry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, isAdmin } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Lead ID and status are required' }, { status: 400 });
    }

    const updated = await repo.updateLeadStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead: updated });
  } catch (error: any) {
    console.error('API Leads PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 });
  }
}
