'use client';

import React, { useState } from 'react';
import { Profile, VisitSource } from '@/types/database';
import { Phone, MessageSquare, Mail, UserPlus, Check } from 'lucide-react';
import { downloadVCard } from '@/lib/vcard';
import { getWhatsAppUrl } from '@/lib/utils';

interface ContactActionsProps {
  profile: Profile;
  cardId?: string | null;
  source?: VisitSource;
}

export function ContactActions({ profile, cardId, source = 'direct' }: ContactActionsProps) {
  const [downloaded, setDownloaded] = useState(false);

  // Helper to trigger non-blocking analytics
  const trackAction = (eventType: string) => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile.id,
          card_id: cardId || null,
          event_type: eventType,
          source,
        }),
      }).catch((e) => console.warn('Non-blocking analytics tracking skipped:', e));
    } catch {
      // Ignored
    }
  };

  const handleSaveContact = () => {
    trackAction('contact_download');
    downloadVCard(profile, `${profile.full_name || 'contact'}.vcf`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCall = () => {
    trackAction('call_click');
  };

  const handleWhatsApp = () => {
    trackAction('whatsapp_click');
  };

  const handleEmail = () => {
    trackAction('email_click');
  };

  const whatsAppPhone = profile.whatsapp || profile.phone;
  const whatsAppUrl = whatsAppPhone
    ? getWhatsAppUrl(whatsAppPhone, profile.custom_whatsapp_message)
    : '';

  return (
    <div className="w-full px-6 space-y-3 mt-6">
      {/* Primary Save Contact Button (Full width prominent CTA) */}
      <button
        onClick={handleSaveContact}
        className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.99] hover:opacity-95"
        style={{ backgroundColor: profile.accent_color || '#2563eb' }}
      >
        {downloaded ? (
          <>
            <Check className="w-5 h-5 text-white" />
            <span>Contact Saved to Phone!</span>
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5 text-white" />
            <span>Save Contact</span>
          </>
        )}
      </button>

      {/* Grid of Direct Communication Buttons (WhatsApp, Call, Email) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* WhatsApp */}
        {whatsAppUrl ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-colors text-center active:scale-95"
          >
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 opacity-60">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </div>
        )}

        {/* Phone Call */}
        {profile.phone ? (
          <a
            href={`tel:${profile.phone}`}
            onClick={handleCall}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors text-center active:scale-95"
          >
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-semibold">Call</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 opacity-60">
            <Phone className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold">Call</span>
          </div>
        )}

        {/* Email */}
        {profile.email ? (
          <a
            href={`mailto:${profile.email}`}
            onClick={handleEmail}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors text-center active:scale-95"
          >
            <Mail className="w-5 h-5 text-slate-600" />
            <span className="text-xs font-semibold">Email</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 opacity-60">
            <Mail className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-semibold">Email</span>
          </div>
        )}
      </div>
    </div>
  );
}

