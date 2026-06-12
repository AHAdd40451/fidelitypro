import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * createAdminClient returns a Supabase client that bypasses Row Level Security
 * using the service role key. Only use this inside Edge Functions that have
 * already performed their own authorisation checks.
 *
 * Required environment variables (set in supabase/config.toml or Supabase dashboard):
 *   SUPABASE_URL          — Your project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role secret (never expose to client)
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Prevent the admin client from persisting sessions or refreshing tokens.
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * createUserClient creates a Supabase client that operates with the
 * calling user's JWT, respecting Row Level Security. Used when you want
 * Supabase's RLS to apply rather than bypassing it.
 */
export function createUserClient(authHeader: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl) throw new Error('Missing environment variable: SUPABASE_URL');
  if (!anonKey) throw new Error('Missing environment variable: SUPABASE_ANON_KEY');

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
