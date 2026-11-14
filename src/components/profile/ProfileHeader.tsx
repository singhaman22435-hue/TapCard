import React from 'react';
import { Profile } from '@/types/database';
import { MapPin, Building2, Briefcase } from 'lucide-react';
import Image from 'next/image';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'TC';

  return (
    <div className="relative text-center">
      {/* Cover Image or subtle ambient header */}
      <div className="h-32 sm:h-36 w-full rounded-t-2xl relative overflow-hidden bg-slate-100">
        {profile.cover_image ? (
          <Image
            src={profile.cover_image}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full opacity-90"
            style={{
              background: `linear-gradient(135deg, ${profile.accent_color || '#2563eb'} 0%, #0f172a 100%)`,
            }}
          />
        )}
      </div>

      {/* Avatar Container */}
      <div className="relative -mt-16 sm:-mt-20 inline-block">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-white mx-auto relative flex items-center justify-center">
          {profile.profile_photo ? (
            <Image
              src={profile.profile_photo}
              alt={profile.full_name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold tracking-wider"
              style={{ backgroundColor: profile.accent_color || '#2563eb' }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Name & Title */}
      <div className="mt-3 px-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {profile.full_name}
        </h1>

        {profile.designation && (
          <p className="text-sm sm:text-base font-semibold text-slate-700 flex items-center justify-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{profile.designation}</span>
          </p>
        )}

        {profile.company && (
          <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{profile.company}</span>
          </p>
        )}

        {(profile.city || profile.country) && (
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 pt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              {[profile.city, profile.country].filter(Boolean).join(', ')}
            </span>
          </p>
        )}
      </div>

      {/* Bio / About preview */}
      {profile.bio && (
        <div className="mt-4 px-6">
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
}

