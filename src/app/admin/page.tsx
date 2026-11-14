import React from 'react';
import Link from 'next/link';
import { repo } from '@/lib/db/repository';
import {
  Users,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Wifi,
  QrCode,
  Inbox,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default async function AdminOverviewPage() {
  const [profiles, cards, orders, leads, analyticsSummary] = await Promise.all([
    repo.getAllProfiles(),
    repo.getAllCards(),
    repo.getOrders(),
    repo.getLeads(),
    repo.getAnalyticsSummary(),
  ]);

  const activeCardsCount = cards.filter((c) => c.status === 'ACTIVE').length;
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'PENDING' || o.order_status === 'PROCESSING').length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Master Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global metrics for physical cards, customer profiles, hardware logistics, and live telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/cards"
            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Manage Card Inventory
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Profiles
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{profiles.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active customer identities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active NFC Cards
            </span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{activeCardsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Of {cards.length} total manufactured</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{orders.length}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {pendingOrdersCount} pending dispatch
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Gross Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Physical cards & SaaS</p>
        </div>
      </div>

      {/* Global Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Views</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {analyticsSummary.totalViews}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">NFC Taps</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {analyticsSummary.nfcTaps}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">QR Scans</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {analyticsSummary.qrScans}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Inquiries</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {leads.length}
            </span>
          </div>
        </div>
      </div>

      {/* Split Section: Cards Ready for Hardware Ops & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Physical Cards Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Card Inventory Snapshot</h3>
              <p className="text-xs text-slate-500">Latest manufactured NFC cards</p>
            </div>
            <Link
              href="/admin/cards"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All ({cards.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {cards.slice(0, 5).map((card) => (
              <div key={card.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{card.card_code}</span>
                    <span className="capitalize text-slate-500">• {card.card_type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {card.profile?.full_name ? `Assigned to ${card.profile.full_name}` : 'Unassigned (Available in stock)'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      card.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : card.status === 'AVAILABLE'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {card.status}
                  </span>

                  <Link
                    href={`/admin/cards/${card.id}/test`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    title="NFC Hardware Test"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Shipping & physical programming queue</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Orders ({orders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
                    <span className="text-slate-500">• {order.shipping_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {order.shipping_city}, {order.shipping_state} • ₹{order.amount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      order.order_status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.order_status === 'SHIPPED'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {order.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

