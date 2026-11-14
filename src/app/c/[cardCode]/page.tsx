import { Metadata } from 'next';
import { repo } from '@/lib/db/repository';
import { VisitSource } from '@/types/database';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContactActions } from '@/components/profile/ContactActions';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { ServicesSection } from '@/components/profile/ServicesSection';
import { LeadForm } from '@/components/profile/LeadForm';
import { ProfileFooter } from '@/components/profile/ProfileFooter';
import { AnalyticsTracker } from '@/components/profile/AnalyticsTracker';
import { CreditCard, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    cardCode: string;
  };
  searchParams: {
    source?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { profile } = await repo.resolvePublicIdentifier(params.cardCode);

  if (!profile) {
    return {
      title: 'TapCard | Digital Visiting Card',
      description: 'TapCard NFC & QR Digital Profile.',
    };
  }

  const title = `${profile.full_name} | ${profile.designation || 'TapCard Profile'}`;
  const description =
    profile.bio ||
    `Connect with ${profile.full_name} at ${profile.company || 'TapCard'}. Tap or scan to save contact info, WhatsApp, and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.profile_photo ? [{ url: profile.profile_photo }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile.profile_photo ? [profile.profile_photo] : [],
    },
  };
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const rawSource = searchParams.source?.toLowerCase();
  const source: VisitSource = rawSource === 'nfc' || rawSource === 'qr' ? rawSource : 'direct';

  const resolution = await repo.resolvePublicIdentifier(params.cardCode);

  // Handle physical card and profile status lifecycle (Items 16 & 18)
  if (resolution.errorReason) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          {resolution.errorReason === 'CARD_REPLACED' && (
            <>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Card Has Been Replaced</h2>
              <p className="text-sm text-slate-600">
                This physical TapCard has been decommissioned and replaced with a newer card by the owner.
              </p>
            </>
          )}

          {resolution.errorReason === 'CARD_INACTIVE' && (
            <>
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Card Currently Inactive</h2>
              <p className="text-sm text-slate-600">
                This TapCard is temporarily suspended or disabled. Please contact the card owner.
              </p>
            </>
          )}

          {resolution.errorReason === 'CARD_UNASSIGNED' && (
            <>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-200">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Card Not Yet Activated</h2>
              <p className="text-sm text-slate-600">
                This physical NFC card (<strong>{params.cardCode}</strong>) is ready for assignment. If this is your card, please log into your TapCard dashboard to link your profile.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Activate in Dashboard
                </Link>
              </div>
            </>
          )}

          {resolution.errorReason === 'PROFILE_INACTIVE' && (
            <>
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Profile Unavailable</h2>
              <p className="text-sm text-slate-600">
                The profile linked to this card is currently private or unlisted.
              </p>
            </>
          )}

          {resolution.errorReason === 'CARD_NOT_FOUND' && (
            <>
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Card Not Found</h2>
              <p className="text-sm text-slate-600">
                We couldn&apos;t locate any active digital visiting card or profile matching &quot;{params.cardCode}&quot;.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Go to TapCard Home
                </Link>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">Powered by TapCard</span>
          </div>
        </div>
      </div>
    );
  }

  const { profile, card } = resolution;
  if (!profile) return null;

  return (
    <main className="min-h-screen bg-slate-100 sm:py-8 sm:px-4 flex justify-center animate-in fade-in">
      <AnalyticsTracker
        profileId={profile.id}
        cardId={card?.id || null}
        source={source}
      />

      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl shadow-sm border-y sm:border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div>
          {/* Subtle indicator for scan source */}
          {source !== 'direct' && (
            <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-1.5">
              <span>Opened via</span>
              <span className="font-bold uppercase tracking-wider text-blue-400">
                {source === 'nfc' ? '⚡ Contactless NFC Tap' : '📷 Camera QR Scan'}
              </span>
            </div>
          )}

          {/* Section 1: Header (Avatar, Banner, Name, Title, Bio) */}
          <ProfileHeader profile={profile} />

          {/* Section 2: Contact Actions (Save Contact, Call, WhatsApp, Email) */}
          <ContactActions profile={profile} cardId={card?.id || null} source={source} />

          {/* Section 3: Social & Web Links */}
          <SocialLinks profile={profile} cardId={card?.id || null} source={source} />

          {/* Section 4: Services / Offerings */}
          <ServicesSection profile={profile} />

          {/* Section 5: Lead Capture Exchange Form */}
          <LeadForm profile={profile} cardId={card?.id || null} source={source} />
        </div>

        {/* Section 6: Footer */}
        <ProfileFooter fullName={profile.full_name} />
      </div>
    </main>
  );
}
