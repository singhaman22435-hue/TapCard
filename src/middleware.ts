import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /dashboard routes (Customer Portal)
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin routes (Admin Portal, except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const adminLoginUrl = request.nextUrl.clone();
      adminLoginUrl.pathname = '/admin/login';
      return NextResponse.redirect(adminLoginUrl);
    }

    // Server-side check for administrative privileges in admin_users table
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isUserAdmin = Boolean(
      adminRecord?.role === 'admin' ||
      adminRecord?.role === 'super_admin' ||
      user.app_metadata?.role === 'admin'
    );

    if (!isUserAdmin) {
      const adminLoginUrl = request.nextUrl.clone();
      adminLoginUrl.pathname = '/admin/login';
      adminLoginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
