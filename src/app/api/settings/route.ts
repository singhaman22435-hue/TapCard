import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function GET() {
  try {
    const plans = await repo.getPlans();
    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error('API Settings GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin } = await getAuthenticatedUser();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required to modify platform pricing' }, { status: 403 });
    }

    const body = await request.json();
    const { planId, ...updates } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const updated = await repo.updatePlan(planId, updates);
    return NextResponse.json({ plan: updated });
  } catch (error: any) {
    console.error('API Settings PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update plan' }, { status: 500 });
  }
}
