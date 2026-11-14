'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            TC
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            TapCard<span className="text-blue-600">.</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter your account email to receive recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {isSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-emerald-900">
                Recovery link sent
              </p>
              <p className="text-xs text-emerald-700">
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
              <div className="pt-2">
                <Link href="/login" className="text-xs font-bold text-emerald-800 underline">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="you@company.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

