import React from 'react';
import { Profile } from '@/types/database';
import { CheckCircle2 } from 'lucide-react';

interface ServicesSectionProps {
  profile: Profile;
}

export function ServicesSection({ profile }: ServicesSectionProps) {
  if (!profile.services || profile.services.length === 0) return null;

  return (
    <div className="w-full px-6 mt-6 text-left">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Services & Expertise
      </h3>

      <div className="space-y-2.5">
        {profile.services.map((service) => (
          <div
            key={service.id}
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: profile.accent_color || '#2563eb' }}
                />
                <h4 className="text-sm font-semibold text-slate-800">
                  {service.title}
                </h4>
              </div>
              {service.price && (
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                  {service.price}
                </span>
              )}
            </div>
            {service.description && (
              <p className="text-xs text-slate-500 mt-1.5 pl-6 leading-relaxed">
                {service.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
