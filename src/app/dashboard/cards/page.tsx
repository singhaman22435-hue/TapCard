'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Card } from '@/types/database';
import { CardPreview } from '@/components/ui/CardPreview';
import { Badge } from '@/components/ui/Badge';
import { getCardUrl, formatDate } from '@/lib/utils';
import {
  Wifi,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  ShoppingBag,
  Sparkles,
  Info,
} from 'lucide-react';

export default function MyCardsPage() {
  const { profile, user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCards() {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/cards?profileId=${profile.id}`);
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
          if (data.cards?.length > 0) {
            setSelectedCard(data.cards[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load user cards:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCards();
  }, [profile?.id]);

  const handleCopy = async (text: string, identifier: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(identifier);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getStatusBadge = (status: Card['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active & Programmed</Badge>;
      case 'ASSIGNED':
      case 'PROGRAMMING':
        return <Badge variant="warning">In Programming</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">Suspended</Badge>;
      case 'REPLACED':
        return <Badge variant="default">Replaced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My TapCards</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your physical NFC visiting cards and verify your live NDEF HTTPS destination.
          </p>
        </div>

        <Link
          href="/dashboard/order"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order Another Card</span>
        </Link>
      </div>

      {cards.length === 0 && !isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Physical Cards Assigned Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You currently have a digital profile and QR code. Order an executive physical NFC card to start tapping contacts with any smartphone!
          </p>
          <Link
            href="/dashboard/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Order Your First NFC Card</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Physical Card Preview */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live Card Hardware Preview
              </span>
            </div>

            {profile && selectedCard && (
              <CardPreview
                profile={profile}
                cardCode={selectedCard.card_code}
                cardType={selectedCard.card_type}
                design={selectedCard.design_template}
                showToggle={true}
              />
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>How NFC works:</strong> The physical card contains an embedded high-frequency NDEF chip holding your short HTTPS link. When someone taps their phone near your card, the browser opens your profile instantly.
              </p>
            </div>
          </div>

          {/* Right Column: Card Details & List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Assigned Cards ({cards.length})
            </h3>

            <div className="space-y-4">
              {cards.map((card) => {
                const cardNfcUrl = getCardUrl(card.card_code, 'nfc');
                const cardQrUrl = getCardUrl(card.card_code, 'qr');

                return (
                  <div
                    key={card.id}
                    className={`p-5 rounded-2xl border bg-white shadow-xs transition-all ${
                      selectedCard?.id === card.id
                        ? 'border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-blue-600" />
                          <h4 className="text-base font-bold font-mono text-slate-900">
                            {card.card_code}
                          </h4>
                          <span className="text-xs text-slate-400 capitalize">
                            • {card.card_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Assigned: {formatDate(card.assigned_at || card.created_at)}
                        </p>
                      </div>

                      <div>{getStatusBadge(card.status)}</div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            NFC Chip URL (Written to physical card)
                          </span>
                          <span className="font-mono text-slate-700 truncate block">
                            {cardNfcUrl}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(cardNfcUrl, `${card.id}-nfc`);
                          }}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 self-start sm:self-auto shrink-0"
                        >
                          {copiedCode === `${card.id}-nfc` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2">
                      <Link
                        href={`/dashboard/qr?code=${card.card_code}`}
                        className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR Code</span>
                      </Link>

                      <Link
                        href={`/c/${card.card_code}?source=nfc`}
                        target="_blank"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>Simulate NFC Tap</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
