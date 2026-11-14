import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { AnalyticsEventType, VisitSource } from '@/types/database';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Deduplication map: session/IP + event_type + profile_id within 15 seconds
const dedupCache = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const { user, isAdmin } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const days = Number(searchParams.get('days')) || 7;

    if (profileId) {
      const profile = await repo.getProfileById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      if (profile.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Cannot view analytics for another user' }, { status: 403 });
      }

      const summary = await repo.getAnalyticsSummary(profileId);
      const timeline = await repo.getAnalyticsDailyTimeline(profileId, days);
      return NextResponse.json({ summary, timeline });
    }

    // Default to user's primary profile
    const userProfile = await repo.getProfileByUserId(user.id);
    if (!userProfile) {
      return NextResponse.json({ summary: null, timeline: [] });
    }

    const summary = await repo.getAnalyticsSummary(userProfile.id);
    const timeline = await repo.getAnalyticsDailyTimeline(userProfile.id, days);
    return NextResponse.json({ summary, timeline });
  } catch (error: any) {
    console.error('API Analytics GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`analytics_${ip}`, { intervalMs: 60_000, maxRequests: 60 });
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: 'Rate limit' }, { status: 429 });
    }

    const body = await request.json();
    const { profile_id, card_id, event_type, source, session_id, metadata } = body;

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: 'profile_id and event_type are required' }, { status: 400 });
    }

    // Analytics Deduplication (Item 24)
    // Avoid double-counting page views on quick refreshes or strict re-renders within 15 seconds
    const dedupKey = `${ip}_${session_id || 'anon'}_${profile_id}_${event_type}`;
    const now = Date.now();
    const lastSeen = dedupCache.get(dedupKey);

    if (lastSeen && now - lastSeen < 15_000) {
      return NextResponse.json({ success: true, deduplicated: true }, { status: 200 });
    }
    dedupCache.set(dedupKey, now);

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
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
