'use client';

import React from 'react';
import { Profile, VisitSource } from '@/types/database';
import {
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Youtube,
  Facebook,
  ExternalLink,
} from 'lucide-react';

interface SocialLinksProps {
  profile: Profile;
  cardId?: string | null;
  source?: VisitSource;
}

export function SocialLinks({ profile, cardId, source = 'direct' }: SocialLinksProps) {
  const trackSocialClick = (platform: string, eventType: string = 'website_click') => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile.id,
          card_id: cardId || null,
          event_type: eventType,
          source,
          metadata: { platform },
        }),
      }).catch((e) => console.warn('Social tracking error:', e));
    } catch {
      // Ignored
    }
  };

  const links = [
    {
      platform: 'Website',
      url: profile.website,
      icon: Globe,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      eventType: 'website_click',
    },
    {
      platform: 'LinkedIn',
      url: profile.linkedin,
      icon: Linkedin,
      color: 'text-[#0a66c2] bg-blue-50/70 border-blue-100',
      eventType: 'linkedin_click',
    },
    {
      platform: 'Twitter / X',
      url: profile.twitter,
      icon: Twitter,
      color: 'text-slate-800 bg-slate-100 border-slate-200',
      eventType: 'website_click',
    },
    {
      platform: 'Instagram',
      url: profile.instagram,
      icon: Instagram,
      color: 'text-pink-600 bg-pink-50 border-pink-100',
      eventType: 'instagram_click',
    },
    {
      platform: 'GitHub',
      url: profile.github,
      icon: Github,
      color: 'text-slate-900 bg-slate-100 border-slate-200',
      eventType: 'website_click',
    },
    {
      platform: 'YouTube',
      url: profile.youtube,
      icon: Youtube,
      color: 'text-red-600 bg-red-50 border-red-100',
      eventType: 'website_click',
    },
    {
      platform: 'Facebook',
      url: profile.facebook,
      icon: Facebook,
      color: 'text-blue-700 bg-blue-50 border-blue-100',
      eventType: 'website_click',
    },
  ].filter((item) => Boolean(item.url));

  if (links.length === 0) return null;

  return (
    <div className="w-full px-6 mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-left">
        Connect & Portfolio
      </h3>

      <div className="space-y-2">
        {links.map((link) => {
          const IconComponent = link.icon;
          return (
            <a
              key={link.platform}
              href={link.url!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSocialClick(link.platform, link.eventType)}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${link.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {link.platform}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

