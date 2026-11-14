'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { CardType, CardDesignTemplate, Order } from '@/types/database';
import { CardPreview } from '@/components/ui/CardPreview';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  AlertCircle,
  Package,
} from 'lucide-react';

export default function OrderCardPage() {
  const { user, profile } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedType, setSelectedType] = useState<CardType>('matte_black');
  const [selectedDesign, setSelectedDesign] = useState<CardDesignTemplate>('corporate');
  const [quantity, setQuantity] = useState(1);

  const [shippingForm, setShippingForm] = useState({
    name: user?.fullName || profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cardVariants: Array<{ id: CardType; name: string; desc: string; price: number }> = [
    {
      id: 'matte_black',
      name: 'Matte Executive Black',
      desc: 'High-density matte polymer with silver laser-engraved accents',
      price: 1499,
    },
    {
      id: 'metallic_gold',
      name: 'Brushed Gold Metal',
      desc: 'Heavy stainless alloy with embedded gold finish NFC chip',
      price: 2499,
    },
    {
      id: 'classic_white',
      name: 'Classic Studio White',
      desc: 'Minimal clean matte white with gloss UV spot lettering',
      price: 1299,
    },
    {
      id: 'bamboo_wood',
      name: 'Eco Bamboo Wood',
      desc: 'Sustainably sourced natural bamboo with laser-etched QR',
      price: 1899,
    },
  ];

  const currentVariant = cardVariants.find((v) => v.id === selectedType) || cardVariants[0];
  const totalAmount = currentVariant.price * quantity;

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error('Error loading orders:', e);
      }
    }
    loadOrders();
  }, [user?.id]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!shippingForm.name.trim() || !shippingForm.address.trim() || !shippingForm.phone.trim()) {
      setErrorMessage('Please fill in complete shipping information.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          profile_id: profile?.id || null,
          quantity,
          card_type: selectedType,
          design: selectedDesign,
          amount: totalAmount,
          shipping_name: shippingForm.name,
          shipping_phone: shippingForm.phone,
          shipping_address: shippingForm.address,
          shipping_city: shippingForm.city,
          shipping_state: shippingForm.state,
          shipping_pincode: shippingForm.pincode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place card order.');
      }

      setIsSuccess(true);
      setOrders((prev) => [data.order, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'SHIPPED':
        return <Badge variant="info">Shipped</Badge>;
      case 'NFC_PROGRAMMED':
      case 'PRINTING':
      case 'PROCESSING':
        return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
      case 'PAID':
        return <Badge variant="info">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Physical TapCard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select premium hardware materials, configure shipping, and receive your programmed NFC card with worldwide delivery.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our hardware operations team will program your physical NFC chip with your profile URL, inspect with an Android tag writer, and dispatch via courier.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsSuccess(false)}>
              Order Another Card
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Material Choice */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Hardware Material Choice */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Select Card Material
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cardVariants.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedType(item.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedType === item.id
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Quantity & Design Preset */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Design Layout & Quantity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Design Template
                  </label>
                  <select
                    value={selectedDesign}
                    onChange={(e) => setSelectedDesign(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="corporate">Corporate Executive</option>
                    <option value="minimal">Minimal Modern</option>
                    <option value="modern">Fintech Crisp</option>
                    <option value="elegant">Luxury Gold</option>
                    <option value="creative">Creative Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantity(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                          quantity === num
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Shipping Address */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Shipping & Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Recipient Full Name *"
                  required
                  value={shippingForm.name}
                  onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                />

                <Input
                  label="Contact Phone *"
                  type="tel"
                  required
                  value={shippingForm.phone}
                  onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                />
              </div>

              <Input
                label="Street Address / Flat / Building *"
                required
                value={shippingForm.address}
                onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  value={shippingForm.city}
                  onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                />

                <Input
                  label="State"
                  value={shippingForm.state}
                  onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                />

                <Input
                  label="Pincode"
                  value={shippingForm.pincode}
                  onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<ShoppingBag className="w-5 h-5" />}
            >
              Confirm & Order TapCard (₹{totalAmount})
            </Button>
          </form>

          {/* Right Column: Visual Preview & Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Visual Hardware Proof
                </span>
              </div>

              {profile && (
                <CardPreview
                  profile={profile}
                  cardType={selectedType}
                  design={selectedDesign}
                  cardCode="PREVIEW"
                  showToggle={true}
                />
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{currentVariant.name} × {quantity}</span>
                  <span className="font-mono font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>NFC Chip Encoding & Quality Inspection</span>
                  <span className="text-emerald-600 font-semibold uppercase text-[10px]">Included Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Courier Delivery</span>
                  <span className="text-emerald-600 font-semibold uppercase text-[10px]">Free Shipping</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="font-mono text-blue-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Orders Table */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Order History</h3>
          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{ord.order_number}</span>
                    <span>•</span>
                    <span className="capitalize text-slate-700">{ord.card_type.replace('_', ' ')} (Qty: {ord.quantity})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Placed on {formatDateTime(ord.created_at)} • Shipped to {ord.shipping_city}
                  </p>
                  {ord.tracking_number && (
                    <p className="text-[11px] font-mono text-blue-600 mt-0.5">
                      Tracking: {ord.tracking_number}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-800">₹{ord.amount}</span>
                  {getOrderStatusBadge(ord.order_status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

