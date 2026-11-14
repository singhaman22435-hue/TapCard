'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  User,
  CreditCard,
  QrCode,
  TrendingUp,
  Inbox,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import { getCardUrl } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicUrl = profile ? getCardUrl(profile.slug) : null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'My Card', href: '/dashboard/cards', icon: CreditCard },
    { name: 'QR Code', href: '/dashboard/qr', icon: QrCode },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'Leads', href: '/dashboard/leads', icon: Inbox },
    { name: 'Order Card', href: '/dashboard/order', icon: ShoppingBag },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ---------------- MOBILE TOP BAR ---------------- */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            TC
          </div>
          <span className="font-bold text-slate-900 text-base">TapCard</span>
        </Link>

        <div className="flex items-center gap-2">
          {publicUrl && (
            <Link
              href={publicUrl}
              target="_blank"
              className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ---------------- MOBILE DRAWER MENU ---------------- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-20 bg-white p-4 space-y-2 border-b border-slate-200 animate-in fade-in">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>Admin Portal</span>
            </Link>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-screen sticky top-0 h-screen justify-between p-4">
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-3 mb-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                TC
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                TapCard<span className="text-blue-600">.</span>
              </span>
            </Link>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Admin Portal</span>
              </Link>
            </div>
          )}
        </div>

        {/* Profile Card & Logout */}
        <div className="pt-4 border-t border-slate-200/80 space-y-3">
          {publicUrl && (
            <Link
              href={publicUrl}
              target="_blank"
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
            >
              <span className="truncate">View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>
          )}

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.fullName || profile?.full_name || 'My Account'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@tapcard.in'}
              </p>
            </div>

            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
