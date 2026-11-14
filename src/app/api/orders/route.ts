import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { CardType } from '@/types/database';

// Server-side authoritative pricing table (prevents price manipulation)
const CARD_PRICES: Record<CardType, number> = {
  matte_black: 1499,
  metallic_gold: 2499,
  classic_white: 1299,
  bamboo_wood: 1899,
};

export async function GET(request: NextRequest) {
  try {
    const { user, isAdmin } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');

    // Non-admin users can only view their own orders
    if (!isAdmin) {
      const orders = await repo.getOrders(user.id);
      return NextResponse.json({ orders });
    }

    // Admins can filter by user or view all orders
    const orders = await repo.getOrders(requestedUserId || undefined);
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('API Orders GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`order_${ip}`, { intervalMs: 60_000, maxRequests: 5 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many order attempts. Please try again shortly.' }, { status: 429 });
    }

    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to place an order' }, { status: 401 });
    }

    const body = await request.json();
    const {
      profile_id,
      quantity,
      card_type,
      design,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
    } = body;

    if (!shipping_name?.trim() || !shipping_address?.trim() || !shipping_phone?.trim()) {
      return NextResponse.json(
        { error: 'Complete shipping information (name, address, phone) is required' },
        { status: 400 }
      );
    }

    const validCardType: CardType = (
      card_type === 'metallic_gold' ||
      card_type === 'classic_white' ||
      card_type === 'bamboo_wood'
    ) ? card_type : 'matte_black';

    // Authoritative Server-side Price Calculation (Item 17)
    const validatedQuantity = Math.max(1, Math.min(50, Number(quantity) || 1));
    const unitPrice = CARD_PRICES[validCardType];
    const serverCalculatedAmount = unitPrice * validatedQuantity;

    const order = await repo.createOrder({
      user_id: user.id, // Strictly server-verified user ID
      profile_id: profile_id || null,
      quantity: validatedQuantity,
      card_type: validCardType,
      design: design || 'corporate',
      amount: serverCalculatedAmount,
      shipping_name: shipping_name.trim(),
      shipping_phone: shipping_phone.trim(),
      shipping_address: shipping_address.trim(),
      shipping_city: shipping_city?.trim() || 'New Delhi',
      shipping_state: shipping_state?.trim() || 'Delhi',
      shipping_pincode: shipping_pincode?.trim() || '110001',
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('API Orders POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Updating order status and tracking requires administrative authorization
    const { isAdmin } = await getAuthenticatedUser();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, order_status, payment_status, tracking_number } = body;

    if (!id || !order_status) {
      return NextResponse.json({ error: 'Order ID and order_status are required' }, { status: 400 });
    }

    const updated = await repo.updateOrderStatus(id, order_status, payment_status, tracking_number);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    console.error('API Orders PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
