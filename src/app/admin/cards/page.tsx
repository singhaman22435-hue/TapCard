'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Profile, CardStatus, CardType } from '@/types/database';
import { formatDateTime, getCardUrl } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  Plus,
  Download,
  Wifi,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Generation Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkType, setBulkType] = useState<CardType>('matte_black');
  const [isGenerating, setIsGenerating] = useState(false);

  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCardForAssign, setSelectedCardForAssign] = useState<Card | null>(null);
  const [assignProfileId, setAssignProfileId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Replace Modal State
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [oldCardForReplace, setOldCardForReplace] = useState<Card | null>(null);
  const [newCardIdForReplace, setNewCardIdForReplace] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [cardsRes, profsRes] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/profile'),
      ]);

      if (cardsRes.ok) {
        const cData = await cardsRes.json();
        setCards(cData.cards || []);
        setFilteredCards(cData.cards || []);
      }

      if (profsRes.ok) {
        const pData = await profsRes.json();
        setProfiles(pData.profiles || []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Filter effect
  useEffect(() => {
    let result = [...cards];
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.card_code.toLowerCase().includes(q) ||
          c.card_type.toLowerCase().includes(q) ||
          (c.profile?.full_name && c.profile.full_name.toLowerCase().includes(q))
      );
    }
    setFilteredCards(result);
  }, [search, statusFilter, cards]);

  const handleCopyNfcUrl = async (cardCode: string, id: string) => {
    const url = getCardUrl(cardCode, 'nfc');
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_generate',
          count: bulkCount,
          cardType: bulkType,
        }),
      });

      if (res.ok) {
        await loadData();
        setIsBulkModalOpen(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignCard = async () => {
    if (!selectedCardForAssign || !assignProfileId) return;
    const targetProfile = profiles.find((p) => p.id === assignProfileId);
    if (!targetProfile) return;

    setIsAssigning(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          cardId: selectedCardForAssign.id,
          profileId: targetProfile.id,
          userId: targetProfile.user_id,
        }),
      });

      if (res.ok) {
        await loadData();
        setIsAssignModalOpen(false);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleActivateCard = async (cardId: string) => {
    try {
      const res = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate',
          cardId,
        }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (cardId: string, status: CardStatus) => {
    try {
      const res = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          cardId,
          status,
        }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplaceCard = async () => {
    if (!oldCardForReplace || !newCardIdForReplace) return;
    setIsReplacing(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'replace',
          oldCardId: oldCardForReplace.id,
          newCardId: newCardIdForReplace,
        }),
      });

      if (res.ok) {
        await loadData();
        setIsReplaceModalOpen(false);
      }
    } finally {
      setIsReplacing(false);
    }
  };

  const exportFactoryCSV = () => {
    if (cards.length === 0) return;
    const headers = ['Card Code', 'Profile URL', 'NFC NDEF URI', 'QR URL', 'Card Material', 'Status', 'Assigned To'];
    const rows = cards.map((c) => [
      `"${c.card_code}"`,
      `"${getCardUrl(c.card_code)}"`,
      `"${getCardUrl(c.card_code, 'nfc')}"`,
      `"${getCardUrl(c.card_code, 'qr')}"`,
      `"${c.card_type}"`,
      `"${c.status}"`,
      `"${c.profile?.full_name || 'Unassigned'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tapcard-factory-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Available in-stock cards for replacement
  const availableStockCards = cards.filter((c) => c.status === 'AVAILABLE');

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Card Inventory & NFC</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manufacture, assign, program, and manage hardware lifecycle for all physical NFC chips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={exportFactoryCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Factory CSV
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsBulkModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Bulk Generate Cards
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by card code (e.g. TC-8F72KX), material, or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-white p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {['ALL', 'AVAILABLE', 'ASSIGNED', 'ACTIVE', 'SUSPENDED', 'REPLACED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Card Code</th>
                <th className="py-3 px-4">Material Variant</th>
                <th className="py-3 px-4">Assigned Profile</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">NFC NDEF HTTPS URL</th>
                <th className="py-3 px-4">Created / Activated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCards.map((card) => {
                const nfcUrl = getCardUrl(card.card_code, 'nfc');
                return (
                  <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {card.card_code}
                    </td>

                    <td className="py-3.5 px-4 capitalize text-slate-700">
                      {card.card_type.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      {card.profile ? (
                        <div>
                          <p className="font-semibold text-slate-900">{card.profile.full_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">/{card.profile.slug}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">In Stock (Unassigned)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          card.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : card.status === 'AVAILABLE'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : card.status === 'ASSIGNED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : card.status === 'REPLACED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {card.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                        <span className="truncate max-w-[140px]">{nfcUrl}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyNfcUrl(card.card_code, card.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Copy NFC URL"
                        >
                          {copiedId === card.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDateTime(card.activated_at || card.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* NFC Hardware Test Simulator */}
                        <Link
                          href={`/admin/cards/${card.id}/test`}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                          title="Hardware NFC Test Suite"
                        >
                          <Wifi className="w-3 h-3 text-blue-600" />
                          <span>Test</span>
                        </Link>

                        {/* Assign Button if available */}
                        {card.status === 'AVAILABLE' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCardForAssign(card);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold"
                          >
                            Assign
                          </button>
                        )}

                        {/* Activate Button if assigned */}
                        {card.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            onClick={() => handleActivateCard(card.id)}
                            className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-semibold"
                          >
                            Activate
                          </button>
                        )}

                        {/* Replace Card Button if active */}
                        {card.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => {
                              setOldCardForReplace(card);
                              setIsReplaceModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-semibold flex items-center gap-1"
                            title="Decommission & Re-issue"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Replace</span>
                          </button>
                        )}

                        {/* Suspend Toggle */}
                        {card.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(card.id, 'SUSPENDED')}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Suspend card"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {card.status === 'SUSPENDED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(card.id, 'ACTIVE')}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK GENERATION MODAL */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Manufacture NFC Cards"
        description="Pre-generate physical card codes and URLs for factory production and laser engraving."
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity to Manufacture
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Card Material
            </label>
            <select
              value={bulkType}
              onChange={(e) => setBulkType(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="matte_black">Matte Executive Black</option>
              <option value="metallic_gold">Brushed Gold Metal</option>
              <option value="classic_white">Classic Studio White</option>
              <option value="bamboo_wood">Eco Bamboo Wood</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isGenerating}>
              Generate {bulkCount} Cards
            </Button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN CARD MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Card ${selectedCardForAssign?.card_code}`}
        description="Link this in-stock NFC card to a registered customer profile."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Customer Profile
            </label>
            <select
              value={assignProfileId}
              onChange={(e) => setAssignProfileId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Choose Profile --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.company || 'Individual'}) - /{p.slug}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAssignCard}
              disabled={!assignProfileId}
              isLoading={isAssigning}
            >
              Assign Card
            </Button>
          </div>
        </div>
      </Modal>

      {/* REPLACE CARD MODAL */}
      <Modal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        title={`Replace Lost/Damaged Card ${oldCardForReplace?.card_code}`}
        description="The old card will be decommissioned (status = REPLACED) and the customer's profile will be seamlessly routed to the new card."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
            <strong>Zero Profile Disruption:</strong> The customer&apos;s digital profile data, analytics, and leads remain 100% intact. The old card code will simply return a &quot;Card Has Been Replaced&quot; screen if tapped.
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select New In-Stock Card to Re-Issue
            </label>
            <select
              value={newCardIdForReplace}
              onChange={(e) => setNewCardIdForReplace(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Choose In-Stock Card --</option>
              {availableStockCards.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.card_code} ({sc.card_type.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReplaceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReplaceCard}
              disabled={!newCardIdForReplace}
              isLoading={isReplacing}
            >
              Execute Card Replacement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
