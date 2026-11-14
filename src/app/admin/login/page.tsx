'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Lock, Mail, AlertTriangle, KeyRound, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminSignIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await adminSignIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Administrative verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Terminal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            TapCard Administration
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Internal Operations, Hardware Chip Management & Platform Telemetry Console
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Restricted Access: Authorized Personnel Only</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Administrator Identifier / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@tapcard.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30"
                isLoading={isLoading}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Authenticate Administrative Console
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>

        {/* Security Audit Notice */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          All administrative sessions, NFC chip encodings, and customer overrides are cryptographically logged for audit compliance.
        </p>
      </div>
    </div>
  );
}

