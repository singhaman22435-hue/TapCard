import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  QrCode,
  Smartphone,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { CardPreview } from '@/components/ui/CardPreview';
import { repo } from '@/lib/db/repository';

export default async function LandingPage() {
  const plans = await repo.getPlans();
  const demoProfile = await repo.getProfileBySlug('aman-singh');

  const audience = [
    { title: 'Business Owners', desc: 'Exchange contacts at executive meetings without paper clutter.' },
    { title: 'B2B Sales Teams', desc: 'Equip sales reps with smart cards that auto-capture inbound leads.' },
    { title: 'Real Estate Agents', desc: 'Instantly share property listings, WhatsApp, and brochures.' },
    { title: 'Freelancers & Consultants', desc: 'Direct clients to your verified portfolio and booking link.' },
    { title: 'Designers & Developers', desc: 'Showcase GitHub, Dribbble, and custom interactive demos.' },
    { title: 'Agencies & Studios', desc: 'Standardize brand presentation across all partner interactions.' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* ---------------- NAVIGATION ---------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              TC
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              TapCard<span className="text-blue-600">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#who-is-it-for" className="hover:text-slate-900 transition-colors">Who Is It For</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-lg shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen NFC & QR Contactless Visiting Cards</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your Business Card, <br />
                <span className="text-blue-600">Now One Tap Away.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Share your professional identity instantly with NFC and QR. One card for your phone, WhatsApp, website, portfolio, and contact details. No app installation required for your visitors.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/dashboard/order"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all active:scale-[0.99]"
                >
                  <span>Get Your TapCard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 h-12 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
                >
                  Create Digital Profile
                </Link>
              </div>

              {/* Trust highlights */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Works on iPhone & Android</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Update Profile Anytime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Integrated Lead Capture</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Physical Card + Digital Profile Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-md p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Physical Visiting Card
                  </span>
                </div>

                {/* Interactive Card Preview */}
                <CardPreview
                  profile={demoProfile || { full_name: 'Aman Singh', designation: 'Full Stack Developer', company: 'Nexus Technologies' }}
                  cardCode="TC-8F72KX"
                  cardType="matte_black"
                  showToggle={true}
                />

                {/* Live Public Profile Link */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 mb-1.5">
                    Test live public profile right now:
                  </p>
                  <Link
                    href="/c/TC-8F72KX?source=nfc"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                  >
                    <span>View Live Profile (/c/TC-8F72KX)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Simple 4-Step Process
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              How TapCard Works
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              From order to connection in seconds. No complex hardware programming needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Add your photo, phone, WhatsApp, bio, social networks, and professional services.',
                icon: UserCheck,
              },
              {
                step: '02',
                title: 'Get Your NFC Card',
                desc: 'We encode your secure HTTPS URL into a premium matte, metal, or wood NFC card.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Tap or Scan',
                desc: 'Tap your card against any smartphone or let them scan the crisp laser QR code.',
                icon: Wifi,
              },
              {
                step: '04',
                title: 'Connect Instantly',
                desc: 'They save your vCard directly to contacts, chat on WhatsApp, or send an enquiry.',
                icon: TrendingUp,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-blue-600 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES GRID ---------------- */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Engineered For Modern Business
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Everything Your Identity Needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Contactless NFC Chip',
                desc: 'Integrated NDEF URI record allows modern iPhones and Android phones to open your profile with zero app download.',
                icon: Wifi,
              },
              {
                title: 'High-Contrast QR Fallback',
                desc: 'High error-correction QR code on the back guarantees 100% universal compatibility even on older smartphones.',
                icon: QrCode,
              },
              {
                title: 'One-Tap vCard Download',
                desc: 'Visitors click "Save Contact" and instantly import your name, phone, email, company, and title straight into their phone book.',
                icon: Smartphone,
              },
              {
                title: 'Custom WhatsApp Opener',
                desc: 'Pre-configure a friendly introductory WhatsApp message so people can message you with one tap without typing.',
                icon: MessageSquare,
              },
              {
                title: 'Inbound Lead Capture',
                desc: 'Collect contact details and project briefs directly from your profile. Get notified and manage leads in your dashboard.',
                icon: PhoneCall,
              },
              {
                title: 'Granular Tap Analytics',
                desc: 'Track NFC taps vs. QR scans, button clicks, and conversion rates with detailed charts and time-series reports.',
                icon: TrendingUp,
              },
              {
                title: 'Always Up-To-Date',
                desc: 'Change your phone number or title in your dashboard anytime. Your physical card keeps working without reprogramming!',
                icon: ShieldCheck,
              },
              {
                title: 'Clean Executive Themes',
                desc: 'Select from curated professional color schemes and layouts tailored for serious corporate networking.',
                icon: Layers,
              },
              {
                title: 'Team Management Ready',
                desc: 'Equip your entire sales organization with centralized card assignment, member profiles, and unified CRM leads.',
                icon: UserCheck,
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- WHO IS IT FOR ---------------- */}
      <section id="who-is-it-for" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Versatile Networking
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Built for Professionals Who Connect
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audience.map((a, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {a.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Transparent Pricing
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Choose the Plan That Fits You
            </p>
            <p className="mt-2 text-slate-600 text-sm">
              All plans include lifetime digital profile hosting. Upgrade to physical cards anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((p) => {
              const isPro = p.popular || p.id === 'pro';
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-8 flex flex-col justify-between transition-all ${
                    isPro
                      ? 'bg-white border-2 border-blue-600 shadow-xl relative scale-105 z-10'
                      : 'bg-white border border-slate-200 shadow-xs'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">
                        {p.price === 0 ? 'Free' : `₹${p.price}`}
                      </span>
                      {p.price > 0 && (
                        <span className="text-xs text-slate-500 font-medium">
                          /{p.interval}
                        </span>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                      {p.features.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6">
                    <Link
                      href={p.price === 0 ? '/signup' : '/dashboard/order'}
                      className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                        isPro
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {p.price === 0 ? 'Create Free Profile' : 'Order TapCard Now'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
              TC
            </div>
            <span className="font-semibold text-slate-800 text-sm">TapCard Platform</span>
            <span>•</span>
            <span>One Card. Your Entire Professional Identity.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900 transition-colors">Customer Login</Link>
            <Link href="/admin" className="hover:text-slate-900 transition-colors">Admin Portal</Link>
            <Link href="/c/TC-8F72KX" className="hover:text-slate-900 transition-colors">Demo Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
