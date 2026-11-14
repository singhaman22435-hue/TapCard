import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { User } from '@supabase/supabase-js';

export interface ServerAuthResult {
  user: User | null;
  isAdmin: boolean;
}

/**
 * Validates the authenticated user from the incoming request cookies server-side.
 * Also verifies whether the user holds administrative authorization in admin_users.
 */
export async function getAuthenticatedUser(): Promise<ServerAuthResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { user: null, isAdmin: false };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, isAdmin: false };
  }

  const adminClient = createAdminClient();
  let isAdmin = false;

  if (adminClient) {
    try {
      const { data } = await adminClient
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      isAdmin = Boolean(
        data?.role === 'admin' ||
        data?.role === 'super_admin' ||
        user.app_metadata?.role === 'admin'
      );
    } catch {
      isAdmin = false;
    }
  }

  return { user, isAdmin };
}
