'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  shape?: 'circle' | 'rectangle';
  helperText?: string;
  maxDimension?: number;
}

export function ImageUpload({
  label,
  value,
  onChange,
  shape = 'circle',
  helperText,
  maxDimension = 600,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState(value && !value.startsWith('data:') ? value : '');
  const [dragActive, setDragActive] = useState(false);

  // Compress & resize image client-side to ensure instant loading & low storage footprint
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Draw image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(optimizedDataUrl);
        setIsProcessing(false);
      };

      img.onerror = () => {
        alert('Failed to load image file.');
        setIsProcessing(false);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      alert('Failed to read file.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL input' : 'Or paste image link'}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview & Upload Area */}
      {value ? (
        <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          {shape === 'circle' ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200">
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-28 h-14 rounded-lg overflow-hidden border border-slate-300 shadow-xs shrink-0 bg-slate-200">
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">Image uploaded</p>
            <p className="text-[11px] text-slate-500">Ready for instant card rendering</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isProcessing}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              Change
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-xl border-2 border-dashed transition-all p-5 text-center flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : shape === 'circle' ? (
              <Camera className="w-5 h-5" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isProcessing ? 'Optimizing photo...' : 'Click to upload from device'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Drag & drop, browse photos, or camera (PNG, JPG, WebP)
            </p>
          </div>
        </div>
      )}

      {/* Alternative URL Input Option */}
      {showUrlInput && (
        <div className="pt-2 flex items-center gap-2 animate-in fade-in">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleApplyUrl}>
            Apply Link
          </Button>
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}

