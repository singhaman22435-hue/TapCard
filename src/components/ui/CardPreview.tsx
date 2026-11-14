'use client';

import React, { useState, useEffect } from 'react';
import { CardType, CardDesignTemplate, Profile } from '@/types/database';
import { Wifi, RefreshCw } from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr';
import { getCardUrl } from '@/lib/utils';

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

  const targetUrl = getCardUrl(cardCode || profile.slug || 'TC-DEMO', 'qr');

  useEffect(() => {
    async function makeQR() {
      try {
        const url = await generateQRCodeDataUrl(targetUrl, {
          width: 250,
          margin: 1,
          color: {
            dark: cardType === 'classic_white' ? '#0f172a' : '#ffffff',
            light: cardType === 'classic_white' ? '#ffffff' : '#0f172a',
          },
        });
        setQrDataUrl(url);
      } catch (e) {
        console.error('Failed generating card preview QR:', e);
      }
    }
    makeQR();
  }, [targetUrl, cardType]);

  // Styling based on card material
  const materialStyles: Record<CardType, { cardBg: string; textColor: string; subColor: string; accentBorder: string }> = {
    matte_black: {
      cardBg: 'bg-gradient-to-br from-slate-900 via-neutral-900 to-black shadow-2xl',
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
      accentBorder: 'border-slate-100',
    },
    bamboo_wood: {
      cardBg: 'bg-gradient-to-br from-[#8B5A2B] via-[#A0522D] to-[#6E4720] shadow-xl',
      textColor: 'text-amber-100',
      subColor: 'text-amber-200/80',
      accentBorder: 'border-amber-900/50',
    },
  };

  const currentTheme = materialStyles[cardType] || materialStyles.matte_black;

  return (
    <div className="flex flex-col items-center">
      {/* 3.5" x 2" standard physical business card ratio (1.75 : 1) */}
      <div
        className={`relative w-full max-w-[380px] h-[215px] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden border ${currentTheme.cardBg} ${currentTheme.accentBorder}`}
      >
        {/* Subtle executive chip/pattern decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/[0.03] rounded-full blur-xl pointer-events-none" />

        {side === 'front' ? (
          // ================= FRONT OF CARD =================
          <>
            <div className="flex items-start justify-between z-10">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-tighter ${cardType === 'classic_white' ? 'bg-slate-900 text-white' : 'bg-white/10 text-white backdrop-blur-md border border-white/10'}`}>
                  TC
                </div>
                <span className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.subColor}`}>
                  {profile.company || 'TapCard Business'}
                </span>
              </div>
              
              {/* NFC Contactless Symbol */}
              <div className="flex items-center gap-1.5 opacity-80" title="NFC Enabled">
                <Wifi className={`w-5 h-5 rotate-90 ${currentTheme.textColor}`} />
              </div>
            </div>

            <div className="z-10 space-y-1">
              <h4 className={`text-xl font-bold tracking-tight ${currentTheme.textColor}`}>
                {profile.full_name || 'Your Full Name'}
              </h4>
              <p className={`text-xs font-medium tracking-wide ${currentTheme.subColor}`}>
                {profile.designation || 'Your Designation'}
              </p>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${cardType === 'classic_white' ? 'border-slate-100' : 'border-white/10'} text-[11px] font-mono ${currentTheme.subColor} z-10`}>
              <span>{cardCode || 'TAP-TO-CONNECT'}</span>
              <span className="text-[10px] uppercase tracking-wider">NDEF NFC CHIP</span>
            </div>
          </>
        ) : (
          // ================= BACK OF CARD =================
          <>
            <div className="flex items-center justify-between z-10">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${currentTheme.subColor}`}>
                Scan QR or Tap Phone
              </span>
              <Wifi className={`w-4 h-4 rotate-90 ${currentTheme.textColor}`} />
            </div>

            <div className="flex items-center gap-4 z-10 my-auto">
              <div className="w-24 h-24 bg-white p-1.5 rounded-xl shadow-md shrink-0 flex items-center justify-center">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="TapCard QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded animate-pulse" />
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <p className={`text-xs font-semibold ${currentTheme.textColor}`}>
                  One Card. Entire Identity.
                </p>
                <p className={`text-[11px] ${currentTheme.subColor} leading-relaxed`}>
                  Point camera or hold near any NFC-enabled smartphone.
                </p>
                <p className={`text-[10px] font-mono ${currentTheme.subColor} truncate max-w-[170px]`}>
                  tapcard.in/c/{cardCode}
                </p>
              </div>
            </div>

            <div className={`flex items-center justify-between pt-2 border-t ${cardType === 'classic_white' ? 'border-slate-100' : 'border-white/10'} text-[10px] font-medium ${currentTheme.subColor} z-10`}>
              <span>tapcard.in</span>
              <span>No App Required</span>
            </div>
          </>
        )}
      </div>

      {showToggle && (
        <button
          onClick={() => setSide((prev) => (prev === 'front' ? 'back' : 'front'))}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Flip to {side === 'front' ? 'Back (QR Code)' : 'Front (Executive)'}
        </button>
      )}
    </div>
  );
}

