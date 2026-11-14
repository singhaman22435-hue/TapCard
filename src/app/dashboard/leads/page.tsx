'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Lead, LeadStatus } from '@/types/database';
import { formatDateTime } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Inbox,
  Download,
  Mail,
  Phone,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function LeadsPage() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Selected lead for modal detail view
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadLeads() {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/leads?profileId=${profile.id}`);
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
          setFilteredLeads(data.leads || []);
        }
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeads();
  }, [profile?.id]);

  // Filter effect
  useEffect(() => {
    let result = [...leads];

    if (statusFilter !== 'ALL') {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.phone && l.phone.includes(q)) ||
          (l.message && l.message.toLowerCase().includes(q))
      );
    }

    setFilteredLeads(result);
  }, [search, statusFilter, leads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        if (activeLead?.id === leadId) {
          setActiveLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeLead) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeLead.id,
          status: activeLead.status,
          notes: noteInput,
        }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === activeLead.id ? { ...l, notes: noteInput } : l))
        );
        setActiveLead((prev) => (prev ? { ...prev, notes: noteInput } : null));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Date', 'Message', 'Notes'];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${l.created_at}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tapcard-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbound Leads</h1>
          <p className="text-xs text-slate-500 mt-1">
            Contacts who submitted an inquiry through your digital profile.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={exportCSV}
          disabled={leads.length === 0}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-white p-1 rounded-xl border border-slate-200 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].map((st) => (
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

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLeads.length === 0 && !isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-700">No leads found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search filters.'
                : 'Share your card to start receiving client enquiries!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Visitor / Contact</th>
                  <th className="py-3 px-4">Channel / Source</th>
                  <th className="py-3 px-4">Inquiry Excerpt</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveLead(lead);
                      setNoteInput(lead.notes || '');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{lead.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{lead.phone}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {lead.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 truncate">
                        {lead.message || <span className="text-slate-400 italic">No message</span>}
                      </p>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${
                          lead.status === 'NEW'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : lead.status === 'CONTACTED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : lead.status === 'CONVERTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDateTime(lead.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                          title="Reply via Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {activeLead && (
        <Modal
          isOpen={Boolean(activeLead)}
          onClose={() => setActiveLead(null)}
          title={`Inquiry from ${activeLead.name}`}
          description={`Received via ${activeLead.source.toUpperCase()} on ${formatDateTime(activeLead.created_at)}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Email:</span>
                <a href={`mailto:${activeLead.email}`} className="font-mono text-blue-600 font-medium">
                  {activeLead.email}
                </a>
              </div>
              {activeLead.phone && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Phone:</span>
                  <a href={`tel:${activeLead.phone}`} className="font-mono text-slate-800 font-medium">
                    {activeLead.phone}
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Full Inquiry Message
              </label>
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed min-h-[80px]">
                {activeLead.message || <span className="text-slate-400 italic">No additional message provided.</span>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Internal CRM Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add meeting notes, follow-up dates, or discussion points..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveNotes}
                  isLoading={isUpdating}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

