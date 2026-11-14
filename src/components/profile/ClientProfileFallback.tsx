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
      const stored = localStorage.getItem('tapcard_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored) as Profile;
        const cleanCode = decodeURIComponent(cardCode).trim().toLowerCase();
        if (
          parsed &&
          (parsed.slug?.toLowerCase() === cleanCode ||
           cleanCode === 'preview' ||
           cleanCode === 'aman' ||
           cleanCode.includes(parsed.slug?.toLowerCase() || ''))
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

