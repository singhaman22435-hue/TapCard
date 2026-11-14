import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Supabase Storage is configured, upload to storage bucket
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

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
        console.warn('Supabase storage upload fallback to base64:', storageErr);
      }
    }

    // Direct data URL fallback
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
