'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { generateQRCodeDataUrl, downloadQRCodePng, downloadQRCodeSvg } from '@/lib/qr';
import { getCardUrl } from '@/lib/utils';
import {
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

function QRCodeContent() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const specificCode = searchParams.get('code');

  const cardCodeOrSlug = specificCode || profile?.slug || 'TC-CARD';
  const targetUrl = getCardUrl(cardCodeOrSlug, 'qr');

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    async function makeQR() {
      if (!targetUrl) return;
      setIsGenerating(true);
      try {
        const url = await generateQRCodeDataUrl(targetUrl, {
          width: 600,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Error generating QR:', err);
      } finally {
        setIsGenerating(false);
      }
    }

    makeQR();
  }, [targetUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = async () => {
    await downloadQRCodePng(targetUrl, `tapcard-${cardCodeOrSlug}-qr.png`);
  };

  const handleDownloadSvg = async () => {
    await downloadQRCodeSvg(targetUrl, `tapcard-${cardCodeOrSlug}-qr.svg`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Code Generator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Download your high-resolution QR code for printing on brochures, stands, presentations, or physical cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Code Visual Card */}
        <div className="md:col-span-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-64 h-64 sm:w-72 sm:h-72 bg-white p-4 rounded-2xl border-2 border-slate-900/10 shadow-sm flex items-center justify-center">
            {isGenerating || !qrDataUrl ? (
              <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="TapCard QR Code"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-mono">
              {cardCodeOrSlug}
            </h3>
            <p className="text-xs text-slate-500 font-mono truncate max-w-xs">
              {targetUrl}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Level H (30% Damage Recovery)</span>
          </div>
        </div>

        {/* Right Column: Actions & Options */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Export Options
            </h3>

            <div className="space-y-3">
              <Button
                variant="white"
                className="w-full justify-between h-12 px-4"
                onClick={handleDownloadPng}
                leftIcon={<Download className="w-4 h-4 text-blue-600" />}
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Download PNG Image</p>
                  <p className="text-[11px] text-slate-400">High-resolution for web & screens</p>
                </div>
              </Button>

              <Button
                variant="white"
                className="w-full justify-between h-12 px-4"
                onClick={handleDownloadSvg}
                leftIcon={<Download className="w-4 h-4 text-indigo-600" />}
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Download Scalable SVG</p>
                  <p className="text-[11px] text-slate-400">Infinite vector scale for printing shops</p>
                </div>
              </Button>

              <Button
                variant="white"
                className="w-full justify-between h-12 px-4"
                onClick={handleCopy}
                leftIcon={
                  copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )
                }
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">
                    {copied ? 'Link Copied to Clipboard!' : 'Copy Tracking URL'}
                  </p>
                  <p className="text-[11px] text-slate-400">URL embedded inside this QR</p>
                </div>
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Universal Fallback
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              While NFC provides the seamless contactless tap experience, this QR code ensures anyone with a smartphone camera can access your digital identity instantly—no NFC hardware required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QRCodePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading QR generator...</span>
        </div>
      }
    >
      <QRCodeContent />
    </Suspense>
  );
}
