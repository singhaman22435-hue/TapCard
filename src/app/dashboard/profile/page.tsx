'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ServiceItem } from '@/types/database';
import { slugify } from '@/lib/utils';
import {
  User,
  Briefcase,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  MapPin,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Palette,
  Layers,
  Save,
} from 'lucide-react';

export default function ProfileEditorPage() {
  const { profile, user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    company: '',
    bio: '',
    profile_photo: '',
    cover_image: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    city: '',
    country: 'India',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    github: '',
    theme: 'professional' as const,
    accent_color: '#2563eb',
    font_family: 'inter' as const,
    custom_whatsapp_message: '',
    services: [] as ServiceItem[],
    is_public: true,
  });

  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        designation: profile.designation || '',
        company: profile.company || '',
        bio: profile.bio || '',
        profile_photo: profile.profile_photo || '',
        cover_image: profile.cover_image || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        email: profile.email || '',
        website: profile.website || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'India',
        linkedin: profile.linkedin || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
        github: profile.github || '',
        theme: (profile.theme as any) || 'professional',
        accent_color: profile.accent_color || '#2563eb',
        font_family: (profile.font_family as any) || 'inter',
        custom_whatsapp_message: profile.custom_whatsapp_message || '',
        services: profile.services || [],
        is_public: profile.is_public ?? true,
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.fullName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [profile, user]);

  const handleAddService = () => {
    if (!newServiceTitle.trim()) return;
    const item: ServiceItem = {
      id: Date.now().toString(),
      title: newServiceTitle.trim(),
      description: newServiceDesc.trim(),
      price: newServicePrice.trim() || undefined,
    };
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, item],
    }));
    setNewServiceTitle('');
    setNewServiceDesc('');
    setNewServicePrice('');
  };

  const handleRemoveService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const isNew = !profile?.id;
      const url = '/api/profile';
      const method = isNew ? 'POST' : 'PUT';
      const userSlug = profile?.slug || slugify(formData.full_name.trim());
      const body = isNew
        ? {
            ...formData,
            user_id: user?.id || `usr_${Date.now()}`,
            full_name: formData.full_name.trim(),
            slug: userSlug,
          }
        : {
            id: profile.id,
            ...formData,
            full_name: formData.full_name.trim(),
            slug: userSlug,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile changes.');
      }

      await refreshProfile();
      setSuccessMessage('Profile saved successfully! Your NFC card and QR link update in real time.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Editor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your professional information, theme, and services. Changes reflect immediately on all scanned cards.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
          variant="primary"
          size="md"
        >
          Save Changes
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              required
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />

            <Input
              label="Designation / Title"
              leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <Input
            label="Company / Firm"
            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <ImageUpload
              label="Profile Photo"
              value={formData.profile_photo}
              onChange={(url) => setFormData({ ...formData, profile_photo: url })}
              shape="circle"
              helperText="Square headshot recommended for NFC profile avatar"
            />

            <ImageUpload
              label="Cover Banner Image (Optional)"
              value={formData.cover_image}
              onChange={(url) => setFormData({ ...formData, cover_image: url })}
              shape="rectangle"
              maxDimension={1200}
              helperText="Wide banner image shown behind your avatar on the card"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Professional Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell visitors about your background, expertise, and what drives you..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full text-sm rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* SECTION 2: CONTACT INFORMATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            2. Direct Contact Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="WhatsApp Number"
              type="tel"
              leftIcon={<MessageSquare className="w-4 h-4 text-slate-400" />}
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />

            <Input
              label="Contact Email"
              type="email"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Address / Office"
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <Input
            label="Custom WhatsApp Introductory Message"
            placeholder="Hi, I just tapped your TapCard! I'd love to connect..."
            value={formData.custom_whatsapp_message}
            onChange={(e) => setFormData({ ...formData, custom_whatsapp_message: e.target.value })}
            helperText="Pre-filled text that appears when someone taps the WhatsApp button on your card"
          />
        </div>

        {/* SECTION 3: SOCIAL & WEB */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            3. Web & Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website or Portfolio URL"
              type="url"
              leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />

            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Twitter / X URL"
              placeholder="https://twitter.com/..."
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            />

            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/..."
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub URL"
              placeholder="https://github.com/..."
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            />

            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/..."
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 4: SERVICES & EXPERTISE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            4. Services & Offerings
          </h3>

          <div className="space-y-2">
            {formData.services.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  )}
                  {item.price && (
                    <span className="inline-block mt-1 text-[11px] font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.price}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveService(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Service Box */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
            <p className="text-xs font-bold text-slate-700">Add New Service</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Service title (e.g. Mobile App Development)"
                value={newServiceTitle}
                onChange={(e) => setNewServiceTitle(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Starting price / rate (e.g. ₹50,000+)"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Brief description of the service..."
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-blue-600 focus:outline-none resize-none"
            />
            <button
              type="button"
              onClick={handleAddService}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: CUSTOMIZATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            5. Design & Customization
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Theme Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['professional', 'minimal', 'modern', 'business', 'creative'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: t as any })}
                  className={`p-3 rounded-xl border text-center capitalize text-xs font-bold transition-all ${
                    formData.theme === t
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              {[
                { hex: '#2563eb', label: 'Executive Blue' },
                { hex: '#0f766e', label: 'Teal' },
                { hex: '#4f46e5', label: 'Royal Indigo' },
                { hex: '#0f172a', label: 'Slate' },
                { hex: '#b45309', label: 'Bronze' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, accent_color: c.hex })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    formData.accent_color === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {formData.accent_color === c.hex && <CheckCircle2 className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            isLoading={isSaving}
            size="lg"
            variant="primary"
            leftIcon={<Save className="w-5 h-5" />}
          >
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

