'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { slugify } from '@/lib/utils';
import {
  User,
  Briefcase,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Camera,
  Share2,
  Palette,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Grouped into 5 sleek stages covering all 10 requirements without fatigue

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    designation: '',
    company: '',
    phone: '',
    whatsapp: '',
    email: user?.email || '',
    website: '',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    github: '',
    theme: 'professional' as const,
    accentColor: '#2563eb',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && !formData.fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const slug = slugify(formData.fullName);
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || `usr_${Date.now()}`,
          slug,
          full_name: formData.fullName,
          designation: formData.designation,
          company: formData.company,
          bio: formData.bio || `Professional portfolio of ${formData.fullName}`,
          profile_photo: formData.profilePhoto,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          website: formData.website,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          twitter: formData.twitter,
          github: formData.github,
          theme: formData.theme,
          accent_color: formData.accentColor,
          font_family: 'inter',
          is_public: true,
          status: 'ACTIVE',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize profile.');
      }

      await refreshProfile();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile Setup Wizard • Step {currentStep} of {totalSteps}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Build Your Digital Visiting Card
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            This information will be written into your digital identity and resolved via NFC & QR.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-8">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* STAGE 1: Name, Title & Company */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Basic Information</h3>
                <p className="text-xs text-slate-500">How should people recognize you on your TapCard?</p>
              </div>

              <Input
                label="Full Name *"
                required
                placeholder="e.g. Aman Singh"
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Designation / Role"
                placeholder="e.g. Senior Full Stack Engineer"
                leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />

              <Input
                label="Company / Organization"
                placeholder="e.g. Nexus Technologies"
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          )}

          {/* STAGE 2: Direct Contact Channels */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Direct Contact Information</h3>
                <p className="text-xs text-slate-500">Buttons people can tap on your profile to reach you instantly.</p>
              </div>

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="WhatsApp Number (With Country Code)"
                type="tel"
                placeholder="+91 98765 43210"
                leftIcon={<MessageSquare className="w-4 h-4 text-slate-400" />}
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                helperText="Leave empty to use your phone number"
              />

              <Input
                label="Professional Email"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          )}

          {/* STAGE 3: Web & Bio */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Website & Bio</h3>
                <p className="text-xs text-slate-500">Provide context for visitors when they scan your card.</p>
              </div>

              <Input
                label="Website or Portfolio URL"
                type="url"
                placeholder="https://yourwebsite.com"
                leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />

              <Input
                label="Profile Photo URL"
                type="url"
                placeholder="https://..."
                leftIcon={<Camera className="w-4 h-4 text-slate-400" />}
                value={formData.profilePhoto}
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                helperText="Direct image URL for your profile picture"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Short Professional Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="A brief intro about what you do, who you help, and your key achievements..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* STAGE 4: Social Links */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Social & Professional Channels</h3>
                <p className="text-xs text-slate-500">Add the links where you want to grow your audience.</p>
              </div>

              <Input
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />

              <Input
                label="Twitter / X"
                placeholder="https://twitter.com/username"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              />

              <Input
                label="Instagram"
                placeholder="https://instagram.com/username"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />

              <Input
                label="GitHub"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>
          )}

          {/* STAGE 5: Theme & Styling */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Choose Profile Style</h3>
                <p className="text-xs text-slate-500">Pick a professional theme and primary accent color.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Theme Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'professional', name: 'Professional', desc: 'Trustworthy & clean' },
                    { id: 'minimal', name: 'Minimal', desc: 'Modern high contrast' },
                    { id: 'modern', name: 'Modern', desc: 'Fintech aesthetic' },
                    { id: 'business', name: 'Business', desc: 'Corporate executive' },
                    { id: 'creative', name: 'Creative', desc: 'Designer focus' },
                  ].map((themeItem) => (
                    <button
                      key={themeItem.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: themeItem.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.theme === themeItem.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{themeItem.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{themeItem.desc}</p>
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
                    { color: '#2563eb', label: 'Executive Blue' },
                    { color: '#0f766e', label: 'Teal Emerald' },
                    { color: '#4f46e5', label: 'Indigo Royal' },
                    { color: '#0f172a', label: 'Obsidian Slate' },
                    { color: '#b45309', label: 'Amber Bronze' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, accentColor: c.color })}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        formData.accentColor === c.color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    >
                      {formData.accentColor === c.color && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-800">
                  Ready to launch your card!
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your profile URL will be generated as: <strong>tapcard.in/c/{slugify(formData.fullName || 'user')}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : <div />}

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              isLoading={isSubmitting}
              rightIcon={currentStep === totalSteps ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {currentStep === totalSteps ? 'Complete Profile' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
