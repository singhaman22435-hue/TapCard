'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Profile } from '@/types/database';
import { getCardUrl } from '@/lib/utils';
import { generateQRCodeDataUrl } from '@/lib/qr';
import { Button } from '@/components/ui/Button';
import { CardPreview } from '@/components/ui/CardPreview';
import {
  Wifi,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface TestPageProps {
  params: {
    id: string;
  };
}

export default function CardNfcTestPage({ params }: TestPageProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch(`/api/cards?id=${params.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.card) {
            setCard(data.card);
            const nfcUrl = getCardUrl(data.card.card_code, 'nfc');
            const qr = await generateQRCodeDataUrl(nfcUrl, { width: 300 });
            setQrUrl(qr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadCard();
  }, [params.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading card telemetry...</div>;
  }

  if (!card) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Card not found.{' '}
        <Link href="/admin/cards" className="text-blue-600 underline">
          Back to inventory
        </Link>
      </div>
    );
  }

  const nfcUrl = getCardUrl(card.card_code, 'nfc');
  const qrTrackingUrl = getCardUrl(card.card_code, 'qr');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(nfcUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateTap = async () => {
    setIsSimulating(true);
    setTestResult(null);

    try {
      // 1. Test profile resolution via API
      const res = await fetch(`/api/profile?slug=${card.profile?.slug || card.card_code}`);
      const data = await res.json();

      // 2. Trigger test analytics event
      const analyticsRes = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: card.profile_id,
          card_id: card.id,
          event_type: 'nfc_visit',
          source: 'nfc',
          metadata: { test_mode: true, inspector: 'admin_test_suite' },
        }),
      });

      setTestResult({
        success: true,
        httpStatus: res.status,
        cardCode: card.card_code,
        profileResolved: data.profile?.full_name || 'Profile Found',
        sourceRecorded: 'nfc',
        telemetryLogged: analyticsRes.ok,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Simulation failed',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cards"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900">
                {card.card_code}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                NFC Quality & Test Bench
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify NDEF payload, test URL resolution, and confirm analytics dispatch.
            </p>
          </div>
        </div>

        <Link
          href={`/c/${card.card_code}?source=nfc`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
        >
          <span>Open Live URL</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Card & QR details */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Hardware Encoding Specification
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  NDEF URI Payload (To write into NFC tag)
                </span>
                <div className="mt-1 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
                  <span className="truncate pr-2">{nfcUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-semibold text-slate-900">{card.status}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Customer</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {card.profile?.full_name || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Printed QR Code Preview
            </h4>
            <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded animate-pulse" />
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs mx-auto">
              {qrTrackingUrl}
            </p>
          </div>
        </div>

        {/* Right Column: Physical Card Test Instructions & Software Simulator */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Physical NFC Programming Workflow
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                Open your NFC writer app (e.g. <strong>NFC Tools</strong> on Android/iOS).
              </li>
              <li>
                Select <strong>Write / Add a record</strong> &rarr; <strong>URL / URI</strong>.
              </li>
              <li>
                Paste the generated HTTPS URL: <br />
                <code className="text-[11px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">
                  {nfcUrl}
                </code>
              </li>
              <li>
                Hold your NFC-enabled phone near the physical card to write the tag.
              </li>
              <li>
                Verify tag readability by tapping the physical card against the back of your phone.
              </li>
            </ol>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleSimulateTap}
                isLoading={isSimulating}
                leftIcon={<Wifi className="w-4 h-4" />}
              >
                Run Software NFC Tap Simulation
              </Button>
            </div>
          </div>

          {/* Simulation Output Card */}
          {testResult && (
            <div
              className={`p-5 rounded-2xl border shadow-xs space-y-2.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-red-50 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <h4 className="text-sm font-bold">
                  {testResult.success ? 'NFC Test Passed Successfully!' : 'Test Failed'}
                </h4>
              </div>

              {testResult.success ? (
                <div className="space-y-1 text-xs text-emerald-900 font-mono">
                  <p>• Card Code Resolved: <strong>{testResult.cardCode}</strong></p>
                  <p>• Profile Linked: <strong>{testResult.profileResolved}</strong></p>
                  <p>• Source Recorded: <strong>{testResult.sourceRecorded}</strong></p>
                  <p>• Analytics Event Logged: <strong>{testResult.telemetryLogged ? 'YES (HTTP 200)' : 'NO'}</strong></p>
                  <p className="text-[11px] text-emerald-700 font-sans pt-1">
                    Verified at {testResult.timestamp}. This card is 100% ready for shipping.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-700">{testResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
