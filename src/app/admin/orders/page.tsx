'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderPaymentStatus } from '@/types/database';
import { formatDateTime } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  Package,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Status update modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [newPaymentStatus, setNewPaymentStatus] = useState<OrderPaymentStatus>('PENDING');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== 'ALL') {
      result = result.filter((o) => o.order_status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.shipping_name.toLowerCase().includes(q) ||
          o.shipping_city.toLowerCase().includes(q) ||
          (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
      );
    }
    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  const handleOpenEdit = (order: Order) => {
    setActiveOrder(order);
    setNewStatus(order.order_status);
    setNewPaymentStatus(order.payment_status);
    setTrackingNumber(order.tracking_number || '');
  };

  const handleSaveOrderStatus = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeOrder.id,
          order_status: newStatus,
          payment_status: newPaymentStatus,
          tracking_number: trackingNumber || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === activeOrder.id ? data.order : o))
        );
        setActiveOrder(null);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hardware Orders & Shipping</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track customer card orders, manage factory printing status, program NFC chips, and assign courier tracking.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number (e.g. TC-ORD-10821), recipient, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-white p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'PRINTING', 'NFC_PROGRAMMED', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer & Shipping</th>
                <th className="py-3 px-4">Card Variant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {order.order_number}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{order.shipping_name}</p>
                    <p className="text-[11px] text-slate-500">
                      {order.shipping_city}, {order.shipping_state} ({order.shipping_phone})
                    </p>
                  </td>

                  <td className="py-3.5 px-4 capitalize text-slate-700">
                    {order.card_type.replace('_', ' ')} (Qty: {order.quantity})
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ₹{order.amount}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.payment_status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.order_status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.order_status === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {formatDateTime(order.created_at)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(order)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Order Modal */}
      {activeOrder && (
        <Modal
          isOpen={Boolean(activeOrder)}
          onClose={() => setActiveOrder(null)}
          title={`Manage Order ${activeOrder.order_number}`}
          description={`Recipient: ${activeOrder.shipping_name} • ${activeOrder.shipping_address}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Order Fulfillment Pipeline
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="PENDING">PENDING (Awaiting confirmation)</option>
                <option value="PAID">PAID (Order confirmed)</option>
                <option value="PROCESSING">PROCESSING (Queued for production)</option>
                <option value="PRINTING">PRINTING (Laser engraving card)</option>
                <option value="NFC_PROGRAMMED">NFC_PROGRAMMED (Chip written & verified)</option>
                <option value="SHIPPED">SHIPPED (Handed to courier)</option>
                <option value="DELIVERED">DELIVERED (Completed)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Courier Tracking Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. BLUEDART-88291039"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveOrderStatus}
                isLoading={isUpdating}
              >
                Save Order Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

