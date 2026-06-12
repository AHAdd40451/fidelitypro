// Edge Function: passkit-test-connection
// Tests the PassKit API connection and updates the passkit_configs record.
// Admin only.

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { PassKitClient } from '../_shared/passkit-client.ts';

Deno.serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ---------------------------------------------------------------------------
  // Authenticate — admin only
  // ---------------------------------------------------------------------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header', 401);
  }

  const supabase = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );
  if (authError || !user) {
    return errorResponse('Unauthorized', 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return errorResponse('Profile not found', 403);
  }

  if (profile.role !== 'admin') {
    return errorResponse('Forbidden: admin access required', 403);
  }

  // ---------------------------------------------------------------------------
  // Test PassKit connection
  // ---------------------------------------------------------------------------
  const now = new Date().toISOString();
  let connected = false;
  let environment = 'sandbox';
  let errorMessage: string | null = null;

  try {
    const passkit = new PassKitClient();
    const result = await passkit.testConnection();
    connected = result.connected;
    environment = result.environment;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error('PassKit connection test failed:', errorMessage);
  }

  // ---------------------------------------------------------------------------
  // Update passkit_configs
  // ---------------------------------------------------------------------------
  // Find existing config or create one
  const { data: existingConfig } = await supabase
    .from('passkit_configs')
    .select('id')
    .limit(1)
    .single();

  if (existingConfig?.id) {
    await supabase
      .from('passkit_configs')
      .update({
        status: connected ? 'connected' : 'disconnected',
        environment,
        last_tested_at: now,
      })
      .eq('id', existingConfig.id);
  } else {
    await supabase.from('passkit_configs').insert({
      environment,
      status: connected ? 'connected' : 'disconnected',
      last_tested_at: now,
    });
  }

  // Log the test operation
  await supabase.from('passkit_operations').insert({
    operation_type: 'test_connection',
    status: connected ? 'success' : 'failed',
    response_payload: connected
      ? ({ connected, environment } as unknown as Record<string, unknown>)
      : null,
    error_message: errorMessage,
    created_by: user.id,
  });

  return jsonResponse({
    success: connected,
    connected,
    environment,
    tested_at: now,
    ...(errorMessage ? { error: errorMessage } : {}),
  });
});
