import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { AnalyticsEventType, VisitSource } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId') || undefined;
    const days = Number(searchParams.get('days')) || 7;

    const summary = await repo.getAnalyticsSummary(profileId);
    const timeline = await repo.getAnalyticsDailyTimeline(profileId, days);

    return NextResponse.json({ summary, timeline });
  } catch (error: any) {
    console.error('API Analytics GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, card_id, event_type, source, session_id, metadata } = body;

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: 'profile_id and event_type are required' }, { status: 400 });
    }

    const event = await repo.recordAnalyticsEvent({
      profile_id,
      card_id: card_id || null,
      event_type: event_type as AnalyticsEventType,
      source: (source as VisitSource) || 'direct',
      session_id,
      metadata,
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    console.error('API Analytics POST Error:', error);
    // Return 200 with non-blocking error indication so profile pages never fail if analytics blips
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
