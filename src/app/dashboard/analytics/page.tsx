'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Eye,
  Wifi,
  QrCode,
  MessageSquare,
  Phone,
  UserPlus,
  Inbox,
  TrendingUp,
  Percent,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [days, setDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics?profileId=${profile.id}&days=${days}`);
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
          setTimeline(data.timeline || []);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [profile?.id, days]);

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitor Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry showing physical card taps, QR scans, CTA clicks, and lead conversions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
          {[
            { label: 'Last 7 Days', value: 7 },
            { label: 'Last 14 Days', value: 14 },
            { label: 'Last 30 Days', value: 30 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDays(option.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                days === option.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Views
            </span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {isLoading ? '...' : (summary?.totalViews ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct & contactless visits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              NFC Card Taps
            </span>
            <Wifi className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {isLoading ? '...' : (summary?.nfcTaps ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Source = nfc</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              QR Code Scans
            </span>
            <QrCode className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {isLoading ? '...' : (summary?.qrScans ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Source = qr</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Conversion Rate
            </span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {isLoading ? '...' : `${summary?.conversionRate ?? 0}%`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary?.totalLeads ?? 0} total leads captured
          </p>
        </div>
      </div>

      {/* Recharts Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Traffic Timeline</h3>
            <p className="text-xs text-slate-500">Comparing Views, NFC taps, and QR scans over time</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="nfcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Profile Views"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#viewsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="nfc"
                  name="NFC Taps"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#nfcGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No activity recorded in this period.
            </div>
          )}
        </div>
      </div>

      {/* Action Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              WhatsApp Clicks
            </span>
            <p className="text-xl font-bold text-slate-900">
              {summary?.whatsappClicks ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Phone Calls
            </span>
            <p className="text-xl font-bold text-slate-900">
              {summary?.callClicks ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              vCards Saved
            </span>
            <p className="text-xl font-bold text-slate-900">
              {summary?.contactDownloads ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

