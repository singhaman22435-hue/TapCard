'use client';

import React, { useState } from 'react';
import { Profile, VisitSource } from '@/types/database';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface LeadFormProps {
  profile: Profile;
  cardId?: string | null;
  source?: VisitSource;
}

export function LeadForm({ profile, cardId, source = 'direct' }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide your name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile.id,
          card_id: cardId || null,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          source,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry.');
      }

      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-6 mt-8 mb-6 text-left">
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Send an Enquiry
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Leave your details and {profile.full_name.split(' ')[0]} will get back to you shortly.
        </p>

        {isSuccess ? (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-sm font-semibold text-emerald-900">
              Thanks! Your enquiry has been submitted.
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Your message was sent directly to {profile.full_name}.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-3 text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Message or Requirement
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what you'd like to collaborate or connect about..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.99] disabled:opacity-50"
              style={{ backgroundColor: profile.accent_color || '#2563eb' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Submit Enquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

