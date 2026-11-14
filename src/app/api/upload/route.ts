import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`upload_${ip}`, { intervalMs: 60_000, maxRequests: 10 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many upload attempts. Please try again shortly.' }, { status: 429 });
    }

    // Optional authenticated user (allows onboarding profile creation with strict IP rate limiting)
    const { user } = await getAuthenticatedUser();
    const folder = user?.id || 'guest';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed limit (5MB)' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type?.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and WebP are supported' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload directly to Supabase Storage bucket 'tapcard-assets'
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;

        const { data, error } = await supabase.storage
          .from('tapcard-assets')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('tapcard-assets')
            .getPublicUrl(fileName);

          return NextResponse.json({
            url: publicUrlData.publicUrl,
            success: true,
          });
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload error:', storageErr);
      }
    }

    // Fallback optimized data URL
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      success: true,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
