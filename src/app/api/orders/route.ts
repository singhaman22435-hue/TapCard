import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const orders = await repo.getOrders(userId);
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('API Orders GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      profile_id,
      quantity,
      card_type,
      design,
      amount,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
    } = body;

    if (!user_id || !shipping_name || !shipping_address || !shipping_phone) {
      return NextResponse.json(
        { error: 'Shipping details and user ID are required' },
        { status: 400 }
      );
    }

    const order = await repo.createOrder({
      user_id,
      profile_id: profile_id || null,
      quantity: Number(quantity) || 1,
      card_type: card_type || 'matte_black',
      design: design || 'corporate',
      amount: Number(amount) || 1499,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city: shipping_city || 'Gurugram',
      shipping_state: shipping_state || 'Haryana',
      shipping_pincode: shipping_pincode || '122002',
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('API Orders POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
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

