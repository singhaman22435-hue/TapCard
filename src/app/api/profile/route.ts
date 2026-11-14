import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');

    // Public lookup by ID or slug is permitted for card viewing
    if (id) {
      const profile = await repo.getProfileById(id);
      return NextResponse.json({ profile });
    }

    if (slug) {
      const profile = await repo.getProfileBySlug(slug);
      return NextResponse.json({ profile });
    }

    if (userId) {
      const profile = await repo.getProfileByUserId(userId);
      return NextResponse.json({ profile });
    }

    // Listing all profiles requires administrative authorization
    const { isAdmin } = await getAuthenticatedUser();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required to view all profiles' },
        { status: 403 }
      );
    }

    const profiles = await repo.getAllProfiles();
    return NextResponse.json({ profiles });
  } catch (error: any) {
    console.error('API Profile GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`profile_create_${ip}`, { intervalMs: 60_000, maxRequests: 5 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to create a profile' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.full_name?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Always enforce the authenticated user's ID (never trust client-supplied userId)
    const profile = await repo.createProfile({
      ...body,
      user_id: user.id,
      full_name: body.full_name.trim(),
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    console.error('API Profile POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, isAdmin } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to update your profile' }, { status: 401 });
    }

    const body = await request.json();
    const { id, user_id: _ignoredUserId, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required for update' }, { status: 400 });
    }

    // Verify ownership: user must own the profile or be an administrator
    const existing = await repo.getProfileById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to modify this profile' }, { status: 403 });
    }

    const updated = await repo.updateProfile(id, updates);
    return NextResponse.json({ profile: updated });
  } catch (error: any) {
    console.error('API Profile PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
