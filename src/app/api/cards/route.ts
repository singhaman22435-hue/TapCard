import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Public lookup of individual card by code or id is permitted for NFC resolving
    if (code) {
      const card = await repo.getCardByCode(code);
      return NextResponse.json({ card });
    }

    if (id) {
      const card = await repo.getCardById(id);
      return NextResponse.json({ card });
    }

    const { user, isAdmin } = await getAuthenticatedUser();

    // Authenticated users can fetch their own cards
    if (userId) {
      if (!user || (user.id !== userId && !isAdmin)) {
        return NextResponse.json({ error: 'Unauthorized: Cannot view another user cards' }, { status: 403 });
      }
      const cards = await repo.getCardsForUser(userId);
      return NextResponse.json({ cards });
    }

    if (profileId) {
      const cards = await repo.getCardsForProfile(profileId);
      return NextResponse.json({ cards });
    }

    // Browsing/listing all cards is an administrative action
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Administrative authorization required' }, { status: 403 });
    }

    const cards = await repo.getAllCards({ status: status as any, search });
    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('API Cards GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getAuthenticatedUser();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can create or bulk-generate cards' }, { status: 403 });
    }

    const body = await request.json();
    const { action, count, cardType, ...cardData } = body;

    if (action === 'bulk_generate') {
      const numToGenerate = Math.min(Math.max(Number(count) || 10, 1), 500);
      const cards = await repo.bulkGenerateCards(numToGenerate, cardType || 'matte_black');
      return NextResponse.json({ success: true, count: cards.length, cards }, { status: 201 });
    }

    const card = await repo.createCard(cardData);
    return NextResponse.json({ card }, { status: 201 });
  } catch (error: any) {
    console.error('API Cards POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create card' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, isAdmin } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, cardId, profileId, userId, status, oldCardId, newCardId } = body;

    // Card activation by authenticated owner
    if (action === 'activate') {
      if (!cardId) {
        return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
      }
      const existing = await repo.getCardById(cardId);
      if (!existing) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
      }
      if (existing.user_id && existing.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Cannot activate card assigned to another user' }, { status: 403 });
      }

      const updated = await repo.activateCard(cardId);
      return NextResponse.json({ card: updated });
    }

    // Administrative operations (assign, replace, status update)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required for card management' }, { status: 403 });
    }

    if (action === 'assign') {
      if (!cardId || !profileId || !userId) {
        return NextResponse.json({ error: 'cardId, profileId, and userId are required' }, { status: 400 });
      }
      const updated = await repo.assignCard(cardId, profileId, userId);
      return NextResponse.json({ card: updated });
    }

    if (action === 'replace') {
      if (!oldCardId || !newCardId) {
        return NextResponse.json({ error: 'oldCardId and newCardId are required' }, { status: 400 });
      }
      const result = await repo.replaceCard(oldCardId, newCardId);
      return NextResponse.json(result);
    }

    if (action === 'status') {
      if (!cardId || !status) {
        return NextResponse.json({ error: 'cardId and status are required' }, { status: 400 });
      }
      const updated = await repo.updateCardStatus(cardId, status);
      return NextResponse.json({ card: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Cards PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update card' }, { status: 500 });
  }
}
