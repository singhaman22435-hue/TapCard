'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Profile, VisitSource } from '@/types/database';
import { ProfileHeader } from './ProfileHeader';
import { ContactActions } from './ContactActions';
import { SocialLinks } from './SocialLinks';
import { ServicesSection } from './ServicesSection';
import { LeadForm } from './LeadForm';
import { ProfileFooter } from './ProfileFooter';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ClientProfileFallbackProps {
  cardCode: string;
  source: VisitSource;
}

export function ClientProfileFallback({ cardCode, source }: ClientProfileFallbackProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      // 1. Check URL query params for ?p= portable profile payload
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const pParam = urlParams.get('p');
        if (pParam) {
          const decodedStr = decodeURIComponent(escape(atob(pParam)));
          const mini = JSON.parse(decodedStr);
          if (mini && mini.n) {
            const payloadProfile: Profile = {
              id: mini.id || `prof_${Date.now()}`,
              user_id: `usr_${mini.s || cardCode}`,
              slug: mini.s || cardCode,
              full_name: mini.n,
              designation: mini.d || '',
              company: mini.c || '',
              bio: mini.b || '',
              phone: mini.p || null,
              whatsapp: mini.w || mini.p || null,
              email: mini.e || null,
              website: mini.u || null,
              profile_photo: mini.ph || null,
              cover_image: null,
              address: null,
              city: null,
              country: 'India',
              linkedin: mini.in || null,
              instagram: mini.ig || null,
              facebook: null,
              twitter: mini.tw || null,
              youtube: null,
              github: mini.gh || null,
              theme: mini.th || 'professional',
              accent_color: mini.ac || '#2563eb',
              font_family: 'inter',
              services: [],
              custom_whatsapp_message: `Hi ${mini.n}, I saw your TapCard and would love to connect!`,
              is_public: true,
              status: 'ACTIVE',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            try {
              localStorage.setItem('tapcard_user_profile', JSON.stringify(payloadProfile));
            } catch {}

            setProfile(payloadProfile);
            setIsChecking(false);
            return;
          }
        }
      }

      // 2. Check local storage
      const stored = localStorage.getItem('tapcard_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored) as Profile;
        const cleanCode = decodeURIComponent(cardCode).trim().toLowerCase();
        if (
          parsed &&
          (parsed.slug?.toLowerCase() === cleanCode ||
           parsed.id === cleanCode ||
           cleanCode === 'preview' ||
           cleanCode.includes(parsed.slug?.toLowerCase() || '') ||
           cleanCode.startsWith('tc-'))
        ) {
          setProfile(parsed);
          setIsChecking(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to read local fallback profile:', e);
    }
    setIsChecking(false);
  }, [cardCode]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Locating digital profile...</span>
        </div>
      </div>
    );
  }

  if (profile) {
    return (
      <main className="min-h-screen bg-slate-100 sm:py-8 sm:px-4 flex justify-center animate-in fade-in">
        <div className="w-full sm:max-w-md bg-white sm:rounded-2xl shadow-sm border-y sm:border border-slate-200 overflow-hidden flex flex-col justify-between">
          <div>
            {source !== 'direct' && (
              <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-1.5">
                <span>Opened via</span>
                <span className="font-bold uppercase tracking-wider text-blue-400">
                  {source === 'nfc' ? '⚡ Contactless NFC Tap' : '📷 Camera QR Scan'}
                </span>
              </div>
            )}

            <ProfileHeader profile={profile} />
            <ContactActions profile={profile} cardId={null} source={source} />
            <SocialLinks profile={profile} cardId={null} source={source} />
            <ServicesSection profile={profile} />
            <LeadForm profile={profile} cardId={null} source={source} />
          </div>

          <ProfileFooter fullName={profile.full_name} />
        </div>
      </main>
    );
  }

  // Not found anywhere
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Card Not Found</h2>
        <p className="text-sm text-slate-600">
          We couldn&apos;t locate any active digital visiting card or profile matching &quot;{cardCode}&quot;.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Go to TapCard Home
          </Link>
        </div>
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Powered by <strong>TapCard</strong>
        </div>
      </div>
    </div>
  );
}

