import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const userId = searchParams.get('userId');

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

    const profiles = await repo.getAllProfiles();
    return NextResponse.json({ profiles });
  } catch (error: any) {
    console.error('API Profile GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.full_name || !body.user_id) {
      return NextResponse.json({ error: 'full_name and user_id are required' }, { status: 400 });
    }

    const profile = await repo.createProfile(body);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    console.error('API Profile POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required for update' }, { status: 400 });
    }

    const updated = await repo.updateProfile(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: updated });
  } catch (error: any) {
    console.error('API Profile PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
