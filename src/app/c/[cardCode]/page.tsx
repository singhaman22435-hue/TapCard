import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { repo } from '@/lib/db/repository';
import { VisitSource, Profile, Card } from '@/types/database';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContactActions } from '@/components/profile/ContactActions';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { ServicesSection } from '@/components/profile/ServicesSection';
import { LeadForm } from '@/components/profile/LeadForm';
import { ProfileFooter } from '@/components/profile/ProfileFooter';
import { AnalyticsTracker } from '@/components/profile/AnalyticsTracker';
import { ClientProfileFallback } from '@/components/profile/ClientProfileFallback';
import { CreditCard, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    cardCode: string;
  };
  searchParams: {
    source?: string;
    p?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  let { profile } = await repo.resolvePublicIdentifier(params.cardCode);

  if (!profile && searchParams?.p) {
    try {
      const decodedStr = decodeURIComponent(escape(atob(searchParams.p)));
      const mini = JSON.parse(decodedStr);
      if (mini && mini.n) {
        profile = {
          id: mini.id || `prof_${params.cardCode}`,
          user_id: `usr_${params.cardCode}`,
          slug: mini.s || params.cardCode,
          full_name: mini.n,
          designation: mini.d || '',
          company: mini.c || '',
          bio: mini.b || '',
          phone: mini.p || null,
          whatsapp: mini.w || mini.p || null,
          email: mini.e || null,
          website: mini.u || null,
          profile_photo: mini.ph || null,
          theme: mini.th || 'professional',
          accent_color: mini.ac || '#2563eb',
          font_family: 'inter',
          is_public: true,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    } catch {}
  }

  if (!profile) {
    return {
      title: 'TapCard | Digital Visiting Card',
      description: 'TapCard NFC & QR Digital Profile.',
    };
  }

  const title = `${profile.full_name} | ${profile.designation || 'TapCard Profile'}`;
  const description = profile.bio || `Connect with ${profile.full_name} at ${profile.company || 'TapCard'}. Tap or scan to save contact info, WhatsApp, and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.profile_photo ? [{ url: profile.profile_photo }] : [],
    },
  };
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const rawSource = searchParams.source?.toLowerCase();
  const source: VisitSource = rawSource === 'nfc' || rawSource === 'qr' ? rawSource : 'direct';

  let resolution = await repo.resolvePublicIdentifier(params.cardCode);

  // If portable profile payload is included in URL (?p=...), hydrate it immediately
  if (resolution.errorReason === 'CARD_NOT_FOUND' && searchParams.p) {
    try {
      const decodedStr = decodeURIComponent(escape(atob(searchParams.p)));
      const mini = JSON.parse(decodedStr);
      if (mini && mini.n) {
        const payloadProfile: Profile = {
          id: mini.id || `prof_${Date.now()}`,
          user_id: `usr_${mini.s || params.cardCode}`,
          slug: mini.s || params.cardCode,
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

        // Cache in repo so subsequent visits work directly
        repo.cacheExternalProfile(payloadProfile).catch(() => {});

        resolution = {
          profile: payloadProfile,
          card: {
            id: 'card_portable',
            card_code: mini.s || params.cardCode,
            profile_id: payloadProfile.id,
            user_id: payloadProfile.user_id,
            card_type: 'matte_black',
            design_template: 'corporate',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
    } catch (e) {
      console.warn('Failed parsing portable QR payload:', e);
    }
  }

  // If not found in memory/database, check if profile exists in user's request cookie
  if (resolution.errorReason === 'CARD_NOT_FOUND') {
    try {
      const cookieStore = cookies();
      const profileCookie = cookieStore.get('tapcard_profile')?.value;
      if (profileCookie) {
        const decoded = JSON.parse(decodeURIComponent(profileCookie)) as Profile;
        const cleanId = decodeURIComponent(params.cardCode).toLowerCase().trim();
        if (
          decoded &&
          (decoded.slug?.toLowerCase() === cleanId ||
           decoded.id === cleanId ||
           cleanId === 'preview')
        ) {
          resolution = {
            profile: decoded,
            card: {
              id: 'card_active_01',
              card_code: decoded.slug || 'TC-ACTIVE',
              profile_id: decoded.id,
              user_id: decoded.user_id,
              card_type: 'matte_black',
              design_template: 'corporate',
              status: 'ACTIVE',
              created_at: decoded.created_at || new Date().toISOString(),
              updated_at: decoded.updated_at || new Date().toISOString(),
            },
          };
        }
      }
    } catch (e) {
      console.warn('Cookie profile parse error:', e);
    }
  }

  // If still CARD_NOT_FOUND, check client-side fallback (e.g. from device localStorage)
  if (resolution.errorReason === 'CARD_NOT_FOUND') {
    return <ClientProfileFallback cardCode={params.cardCode} source={source} />;
  }

  // Handle other physical card status errors
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

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Powered by <strong>TapCard</strong>
          </div>
        </div>
      </div>
    );
  }

  const { profile, card } = resolution;
  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 sm:py-8 sm:px-4 flex justify-center">
      {/* Background Analytics Tracker */}
      <AnalyticsTracker
        profileId={profile.id}
        cardId={card?.id || null}
        source={source}
      />

      {/* Mobile profile card container */}
      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl shadow-sm border-y sm:border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div>
          {/* NFC Tap / QR Source indicator pill */}
          {source !== 'direct' && (
            <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-1.5">
              <span>Opened via</span>
              <span className="font-bold uppercase tracking-wider text-blue-400">
                {source === 'nfc' ? '⚡ Contactless NFC Tap' : '📷 Camera QR Scan'}
              </span>
            </div>
          )}

          {/* Profile Header */}
          <ProfileHeader profile={profile} />

          {/* Primary Contact & vCard Actions */}
          <ContactActions profile={profile} cardId={card?.id} source={source} />

          {/* Social & Portfolio Links */}
          <SocialLinks profile={profile} cardId={card?.id} source={source} />

          {/* Services & Offerings */}
          <ServicesSection profile={profile} />

          {/* Send Enquiry Lead Generation Form */}
          <LeadForm profile={profile} cardId={card?.id} source={source} />
        </div>

        {/* Profile Footer */}
        <ProfileFooter fullName={profile.full_name} />
      </div>
    </main>
  );
}
