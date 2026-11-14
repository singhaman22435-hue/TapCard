'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, Card, Lead } from '@/types/database';
import { formatDateTime } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Search,
  ExternalLink,
  Lock,
  CheckCircle2,
  CreditCard,
  Inbox,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [pRes, cRes, lRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/cards'),
          fetch('/api/leads'),
        ]);

        if (pRes.ok) {
          const pData = await pRes.json();
          setProfiles(pData.profiles || []);
          setFilteredProfiles(pData.profiles || []);
        }

        if (cRes.ok) {
          const cData = await cRes.json();
          setCards(cData.cards || []);
        }

        if (lRes.ok) {
          const lData = await lRes.json();
          setLeads(lData.leads || []);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProfiles(profiles);
      return;
    }
    const q = search.toLowerCase();
    setFilteredProfiles(
      profiles.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.company && p.company.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q))
      )
    );
  }, [search, profiles]);

  const handleToggleStatus = async (profileId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profileId,
          status: nextStatus,
          is_public: nextStatus === 'ACTIVE',
        }),
      });

      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === profileId ? { ...p, status: nextStatus as any } : p))
        );
        if (selectedProfile?.id === profileId) {
          setSelectedProfile((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect customer profiles, audit card assignments, and manage access statuses.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name, email, company, or profile slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Designation & Company</th>
                <th className="py-3 px-4">Profile URL Slug</th>
                <th className="py-3 px-4">Assigned NFC Cards</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((p) => {
                const assigned = cards.filter((c) => c.profile_id === p.id);
                const leadCount = leads.filter((l) => l.profile_id === p.id).length;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedProfile(p)}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.email || 'No email'}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="font-medium">{p.designation || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{p.company || 'Individual'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-blue-600">
                      /{p.slug}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {assigned.length} card{assigned.length === 1 ? '' : 's'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStatus(p.id, p.status)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDateTime(p.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/c/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 inline-flex items-center"
                        title="View Public Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Inspection Modal */}
      {selectedProfile && (
        <Modal
          isOpen={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
          title={selectedProfile.full_name}
          description={`Slug: /${selectedProfile.slug} • Joined ${formatDateTime(selectedProfile.created_at)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Designation</span>
                <span className="font-semibold text-slate-800">{selectedProfile.designation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Company</span>
                <span className="font-semibold text-slate-800">{selectedProfile.company || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                <span className="font-mono text-slate-800">{selectedProfile.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp</span>
                <span className="font-mono text-slate-800">{selectedProfile.whatsapp || 'N/A'}</span>
              </div>
            </div>

            {/* Assigned Cards */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Linked Physical NFC Cards
              </h4>
              <div className="space-y-1.5">
                {cards
                  .filter((c) => c.profile_id === selectedProfile.id)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between font-mono"
                    >
                      <span className="font-bold text-slate-900">{c.card_code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {c.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <Button
                variant={selectedProfile.status === 'ACTIVE' ? 'destructive' : 'primary'}
                size="sm"
                onClick={() => handleToggleStatus(selectedProfile.id, selectedProfile.status)}
              >
                {selectedProfile.status === 'ACTIVE' ? 'Suspend Profile' : 'Reactivate Profile'}
              </Button>

              <Link
                href={`/c/${selectedProfile.slug}`}
                target="_blank"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Open Public Profile &rarr;
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

