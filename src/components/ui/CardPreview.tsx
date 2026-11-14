'use client';

import React, { useState, useEffect } from 'react';
import { CardType, CardDesignTemplate, Profile } from '@/types/database';
import { Wifi, RefreshCw, ExternalLink } from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr';
import { getCardUrl } from '@/lib/utils';
import Link from 'next/link';

interface CardPreviewProps {
  profile: Partial<Profile>;
  cardCode?: string;
  cardType?: CardType;
  design?: CardDesignTemplate;
  showToggle?: boolean;
}

export function CardPreview({
  profile,
  cardCode = 'TC-8F72KX',
  cardType = 'matte_black',
  design = 'corporate',
  showToggle = true,
}: CardPreviewProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Target URL that scanning this QR code opens
  const effectiveCode = cardCode || profile.slug || 'TC-8F72KX';
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    // Canonical, clean card visiting URL
    const url = getCardUrl(effectiveCode, 'qr');
    setTargetUrl(url);

    async function makeQR() {
      try {
        // High contrast black on white with Level M correction for lightning-fast camera detection
        const qr = await generateQRCodeDataUrl(url, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(qr);
      } catch (e) {
        console.error('Failed generating QR code:', e);
      }
    }
    makeQR();
  }, [effectiveCode]);

  // Styling based on card material
  const materialStyles: Record<CardType, { cardBg: string; textColor: string; subColor: string; accentBorder: string }> = {
    matte_black: {
      cardBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black shadow-2xl',
      textColor: 'text-white',
      subColor: 'text-slate-400',
      accentBorder: 'border-slate-800',
    },
    metallic_gold: {
      cardBg: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-900 shadow-2xl',
      textColor: 'text-amber-50',
      subColor: 'text-amber-200',
      accentBorder: 'border-amber-600/40',
    },
    classic_white: {
      cardBg: 'bg-white shadow-xl border border-slate-200',
      textColor: 'text-slate-900',
      subColor: 'text-slate-500',
      accentBorder: 'border-slate-200',
    },
    bamboo_wood: {
      cardBg: 'bg-gradient-to-br from-[#8B5A2B] via-[#A0522D] to-[#6E4720] shadow-xl',
      textColor: 'text-amber-100',
      subColor: 'text-amber-200/80',
      accentBorder: 'border-amber-900/50',
    },
  };

  const currentTheme = materialStyles[cardType] || materialStyles.matte_black;
  const profileDirectUrl = `/c/${effectiveCode}`;

  return (
    <div className="flex flex-col items-center w-full">
      {/* 3.5" x 2" standard physical business card ratio */}
      <div
        className={`relative w-full max-w-[380px] h-[215px] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden border ${currentTheme.cardBg} ${currentTheme.accentBorder}`}
      >
        {/* Subtle ambient light */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/[0.04] rounded-full blur-xl pointer-events-none" />

        {side === 'front' ? (
          // ================= FRONT OF CARD =================
          <>
            <div className="flex items-start justify-between z-10">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-tighter ${cardType === 'classic_white' ? 'bg-slate-900 text-white' : 'bg-white/10 text-white backdrop-blur-md border border-white/15'}`}>
                  TC
                </div>
                <span className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.subColor}`}>
                  {profile.company || 'TapCard Business'}
                </span>
              </div>
              
              {/* NFC Contactless Symbol */}
              <div className="flex items-center gap-1.5 opacity-90" title="Contactless NFC Tag Inside">
                <Wifi className={`w-5 h-5 rotate-90 ${currentTheme.textColor}`} />
              </div>
            </div>

            <div className="z-10 space-y-1">
              <h4 className={`text-xl font-bold tracking-tight ${currentTheme.textColor}`}>
                {profile.full_name || 'Your Name'}
              </h4>
              <p className={`text-xs font-medium tracking-wide ${currentTheme.subColor}`}>
                {profile.designation || 'Your Designation'}
              </p>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${cardType === 'classic_white' ? 'border-slate-100' : 'border-white/10'} text-[11px] font-mono ${currentTheme.subColor} z-10`}>
              <span className="font-bold">{effectiveCode}</span>
              <span className="text-[10px] uppercase tracking-wider">TAP WITH PHONE</span>
            </div>
          </>
        ) : (
          // ================= BACK OF CARD =================
          <>
            <div className="flex items-center justify-between z-10">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${currentTheme.subColor}`}>
                Point Camera at QR or Tap NFC
              </span>
              <Wifi className={`w-4 h-4 rotate-90 ${currentTheme.textColor}`} />
            </div>

            <div className="flex items-center gap-3.5 z-10 my-auto">
              {/* Ultra-clear 100% scannable QR badge */}
              <div className="w-24 h-24 bg-white p-1 rounded-xl shadow-lg shrink-0 flex items-center justify-center border-2 border-white">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Scan QR with Phone"
                    className="w-full h-full object-contain block"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded animate-pulse" />
                )}
              </div>

              <div className="space-y-1 text-left min-w-0">
                <p className={`text-xs font-bold leading-tight ${currentTheme.textColor}`}>
                  Scan with Camera
                </p>
                <p className={`text-[11px] ${currentTheme.subColor} leading-relaxed`}>
                  Opens digital profile instantly. No app required.
                </p>
                <p className={`text-[10px] font-mono ${currentTheme.subColor} truncate max-w-[160px]`}>
                  {effectiveCode}
                </p>
              </div>
            </div>

            <div className={`flex items-center justify-between pt-2 border-t ${cardType === 'classic_white' ? 'border-slate-100' : 'border-white/10'} text-[10px] font-medium ${currentTheme.subColor} z-10`}>
              <span>TapCard Platform</span>
              <span>100% Universal</span>
            </div>
          </>
        )}
      </div>

      {/* Controls below card */}
      <div className="mt-3 flex items-center gap-3">
        {showToggle && (
          <button
            type="button"
            onClick={() => setSide((prev) => (prev === 'front' ? 'back' : 'front'))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors py-1.5 px-3 rounded-lg shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Flip to {side === 'front' ? 'Back (QR Code)' : 'Front (Executive)'}</span>
          </button>
        )}

        <Link
          href={profileDirectUrl}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-lg transition-colors border border-blue-200"
        >
          <span>Open Digital Card</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
