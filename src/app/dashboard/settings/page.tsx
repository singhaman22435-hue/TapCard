'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, User, Sparkles, Check, Lock, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [profileStatus, setProfileStatus] = useState(profile?.status || 'ACTIVE');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'UNLISTED' | 'DISABLED') => {
    if (!profile?.id) return;
    setIsUpdating(true);
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          status: newStatus,
          is_public: newStatus === 'ACTIVE',
        }),
      });

      if (res.ok) {
        setProfileStatus(newStatus);
        setSaved(true);
        await refreshProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Card Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account profile, privacy modes, and plan entitlements.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Account Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {user?.fullName || profile?.full_name || 'User'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
              {user?.email || 'user@tapcard.in'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Privacy / Visibility Control */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Card Privacy & Visibility
          </h3>
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Updated
            </span>
          )}
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'ACTIVE',
              name: 'Public (Recommended)',
              desc: 'Anyone who taps your NFC card or scans your QR code can view your digital profile and save your contact.',
              icon: Globe,
            },
            {
              id: 'UNLISTED',
              name: 'Unlisted',
              desc: 'Accessible only by people with your exact card link. Search engines will not index your profile.',
              icon: Lock,
            },
            {
              id: 'DISABLED',
              name: 'Temporarily Disabled',
              desc: 'Tapping your card shows an inactive status message. Useful if you lose your physical card.',
              icon: ShieldCheck,
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = profileStatus === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => handleStatusChange(mode.id as any)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{mode.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{mode.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan & Subscription Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Current Plan & Entitlements
        </h3>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Pro Executive Plan</span>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Includes unlimited contactless NFC taps, real-time lead capture, and custom executive themes.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => alert('Plan managed via TapCard Admin.')}>
            Manage Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

