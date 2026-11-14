'use client';

import React, { useState } from 'react';
import { Share2, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ProfileFooterProps {
  fullName: string;
}

export function ProfileFooter({ fullName }: ProfileFooterProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = `${fullName} | TapCard Digital Profile`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Connect with ${fullName} on TapCard`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full px-6 pt-4 pb-12 border-t border-slate-100 text-center space-y-4">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share Profile</span>
          </>
        )}
      </button>

      <div className="pt-2">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span>Powered by</span>
          <span className="font-bold text-slate-700">TapCard</span>
          <span className="text-slate-300">•</span>
          <span className="underline underline-offset-2 flex items-center gap-0.5">
            Get your own NFC Card <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

