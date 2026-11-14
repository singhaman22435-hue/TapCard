import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId') || undefined;

    const leads = await repo.getLeads(profileId);
    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error('API Leads GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, card_id, name, email, phone, message, source } = body;

    if (!profile_id || !name || !email) {
      return NextResponse.json(
        { error: 'Name, email, and target profile are required.' },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const lead = await repo.createLead({
      profile_id,
      card_id: card_id || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      message: message ? message.trim() : null,
      source: source || 'direct',
    });

    // Automatically record analytics event for lead submission
    await repo.recordAnalyticsEvent({
      profile_id,
      card_id: card_id || null,
      event_type: 'lead_submit',
      source: source || 'direct',
      metadata: { lead_id: lead.id, name: lead.name },
    });

    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully.', lead },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Leads POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit enquiry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
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
