'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { getCardUrl } from '@/lib/utils';
import { CardPreview } from '@/components/ui/CardPreview';
import {
  Eye,
  Wifi,
  QrCode,
  MessageSquare,
  Inbox,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  UserPlus,
} from 'lucide-react';

interface AnalyticsSummary {
  totalViews: number;
  nfcTaps: number;
  qrScans: number;
  directVisits: number;
  ctaClicks: number;
  whatsappClicks: number;
  callClicks: number;
  contactDownloads: number;
  totalLeads: number;
  conversionRate: number;
}

export default function DashboardHomePage() {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const [analyticsRes, leadsRes] = await Promise.all([
          fetch(`/api/analytics?profileId=${profile.id}`),
          fetch(`/api/leads?profileId=${profile.id}`),
        ]);

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setSummary(aData.summary);
        }

        if (leadsRes.ok) {
          const lData = await leadsRes.json();
          setRecentLeads(lData.leads?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [profile?.id]);

  const profileUrl = profile ? getCardUrl(profile.slug) : '';

  const handleCopyLink = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ---------------- PROFILE BANNER / GET STARTED BANNER ---------------- */}
      {profile ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Active Digital Identity</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.full_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your digital visiting card is live. Share your link, tap with NFC, or scan the QR code to connect.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href={`/c/${profile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>Open Digital Card</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Card Link</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard/qr"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Full Screen QR</span>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-sm shrink-0 flex flex-col items-center">
            <CardPreview
              profile={profile}
              cardCode={profile.slug}
              cardType="matte_black"
              showToggle={true}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Welcome to TapCard
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              You haven&apos;t set up your digital profile yet
            </h2>
            <p className="text-xs text-slate-500 max-w-md">
              Create your digital visiting card with your contact details, designation, WhatsApp, and social profiles.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Your Profile</span>
          </Link>
        </div>
      )}

      {/* Real Database Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Profile Views',
            value: summary?.totalViews ?? 0,
            icon: Eye,
            color: 'text-blue-600 bg-blue-50 border-blue-100',
          },
          {
            label: 'NFC Card Taps',
            value: summary?.nfcTaps ?? 0,
            icon: Wifi,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
          },
          {
            label: 'QR Code Scans',
            value: summary?.qrScans ?? 0,
            icon: QrCode,
            color: 'text-amber-600 bg-amber-50 border-amber-100',
          },
          {
            label: 'WhatsApp Clicks',
            value: summary?.whatsappClicks ?? 0,
            icon: MessageSquare,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          },
          {
            label: 'Inbound Leads',
            value: summary?.totalLeads ?? 0,
            icon: Inbox,
            color: 'text-violet-600 bg-violet-50 border-violet-100',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-md border ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-3">
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? '0' : card.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Row: Leads & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Inquiries</h3>
              <p className="text-xs text-slate-500">Inbound leads captured through your TapCard</p>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No leads submitted yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When visitors submit an enquiry on your card, it will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {lead.email} {lead.phone ? `• ${lead.phone}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {lead.source}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        lead.status === 'NEW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : lead.status === 'CONTACTED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>

            <div className="space-y-2">
              <Link
                href="/dashboard/profile"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Edit Digital Profile
                    </p>
                    <p className="text-[11px] text-slate-400">Photo, bio, WhatsApp, links</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/qr"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Get QR Code
                    </p>
                    <p className="text-[11px] text-slate-400">High-res PNG & SVG</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/order"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      Order Physical NFC Card
                    </p>
                    <p className="text-[11px] text-slate-400">Matte, Gold, Wood</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Your physical card always points to your live digital identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
