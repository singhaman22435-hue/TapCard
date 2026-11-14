'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ShieldAlert,
  CreditCard,
  Users,
  ShoppingBag,
  Sliders,
  LogOut,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, isAdmin, setDemoUser } = useAuth();

  const nav = [
    { name: 'Admin Overview', href: '/admin', icon: ShieldAlert },
    { name: 'Card Inventory & NFC', href: '/admin/cards', icon: CreditCard },
    { name: 'Customer Profiles', href: '/admin/users', icon: Users },
    { name: 'Hardware Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 p-4 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                TC
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  TapCard Admin
                </span>
                <span className="text-[10px] text-blue-400 font-mono">
                  Hardware & SaaS Control
                </span>
              </div>
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <span>Return to User App</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

