import { Profile } from "@/types/database";

/**
 * Generate a standard vCard 3.0 string compatible with iOS and Android devices
 */
export function generateVCardString(profile: Partial<Profile>): string {
  const names = (profile.full_name || 'Contact').trim().split(' ');
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${profile.full_name || 'TapCard Contact'}`,
  ];

  if (profile.company) {
    lines.push(`ORG:${profile.company};`);
  }

  if (profile.designation) {
    lines.push(`TITLE:${profile.designation}`);
  }

  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${profile.phone}`);
  }

  if (profile.whatsapp && profile.whatsapp !== profile.phone) {
    lines.push(`TEL;TYPE=WHATSAPP:${profile.whatsapp}`);
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=WORK,INTERNET:${profile.email}`);
  }

  if (profile.website) {
    lines.push(`URL:${profile.website}`);
  }

  if (profile.address || profile.city || profile.country) {
    const street = (profile.address || '').replace(/[\r\n]+/g, ', ');
    const city = profile.city || '';
    const country = profile.country || '';
    lines.push(`ADR;TYPE=WORK:;;${street};${city};;;${country}`);
  }

  if (profile.bio) {
    const cleanBio = profile.bio.replace(/[\r\n]+/g, '\\n');
    lines.push(`NOTE:${cleanBio}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Trigger client-side download of the .vcf contact card
 */
export function downloadVCard(profile: Partial<Profile>, filename?: string) {
  const vcardContent = generateVCardString(profile);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeName = (profile.full_name || 'contact').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', filename || `${safeName}_contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

