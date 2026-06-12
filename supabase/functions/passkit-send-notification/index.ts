// Edge Function: passkit-send-notification
// Sends push notifications to wallet card holders via PassKit.
// Requires JWT auth (admin or merchant who owns the merchant_id).

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { PassKitClient } from '../_shared/passkit-client.ts';

interface RequestBody {
  merchant_id: string;
  title: string;
  message: string;
  target_type: 'all_customers' | 'inactive_customers' | 'points_above';
  target_filter?: {
    points?: number;
    inactive_days?: number;
  };
}

Deno.serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ---------------------------------------------------------------------------
  // Authenticate
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
    .select('id, role, merchant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return errorResponse('Profile not found', 403);
  }

  // ---------------------------------------------------------------------------
  // Parse body
  // ---------------------------------------------------------------------------
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { merchant_id, title, message, target_type, target_filter } = body;

  if (!merchant_id || !title || !message || !target_type) {
    return errorResponse('merchant_id, title, message, and target_type are required', 400);
  }

  // Authorization check
  if (profile.role !== 'admin' && profile.merchant_id !== merchant_id) {
    return errorResponse('Forbidden: you do not own this merchant', 403);
  }

  // ---------------------------------------------------------------------------
  // Load card design to get program_id for PassKit
  // ---------------------------------------------------------------------------
  const { data: cardDesign } = await supabase
    .from('card_designs')
    .select('passkit_program_id')
    .eq('merchant_id', merchant_id)
    .single();

  const programId = cardDesign?.passkit_program_id;

  // ---------------------------------------------------------------------------
  // Select eligible customers based on target_type
  // ---------------------------------------------------------------------------
  let customerQuery = supabase
    .from('customers')
    .select('id')
    .eq('merchant_id', merchant_id);

  if (target_type === 'inactive_customers') {
    const inactiveDays = target_filter?.inactive_days ?? 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactiveDays);
    customerQuery = customerQuery.lt('last_visit_at', cutoff.toISOString());
  } else if (target_type === 'points_above') {
    const minPoints = target_filter?.points ?? 0;
    customerQuery = customerQuery.gt('points_balance', minPoints);
  }
  // 'all_customers' — no additional filters

  const { data: eligibleCustomers, error: customersError } = await customerQuery;

  if (customersError) {
    console.error('Customers query error:', customersError);
    return errorResponse('Failed to query customers', 500);
  }

  const customerIds = (eligibleCustomers ?? []).map((c: { id: string }) => c.id);

  if (customerIds.length === 0) {
    return jsonResponse({
      success: true,
      recipients_count: 0,
      notification_id: null,
      message: 'No eligible customers matched the target criteria',
    });
  }

  // Load wallet cards for eligible customers
  const { data: walletCards, error: walletError } = await supabase
    .from('wallet_cards')
    .select('id, customer_id, provider')
    .eq('merchant_id', merchant_id)
    .eq('status', 'active')
    .in('customer_id', customerIds);

  if (walletError) {
    console.error('Wallet cards query error:', walletError);
    return errorResponse('Failed to query wallet cards', 500);
  }

  // ---------------------------------------------------------------------------
  // Insert notification record (status = 'sending')
  // ---------------------------------------------------------------------------
  const { data: notification, error: notifError } = await supabase
    .from('notifications')
    .insert({
      merchant_id,
      title,
      message,
      target_type,
      target_filter: target_filter ?? null,
      recipients_count: customerIds.length,
      status: 'sending',
      sent_by: user.id,
    })
    .select('id')
    .single();

  if (notifError || !notification) {
    console.error('Notification insert error:', notifError);
    return errorResponse('Failed to create notification record', 500);
  }

  const notificationId = notification.id;

  // ---------------------------------------------------------------------------
  // Call PassKit sendPushNotification
  // ---------------------------------------------------------------------------
  let passkitSent = 0;
  let passkitError: string | null = null;

  if (programId) {
    try {
      const passkit = new PassKitClient();
      const result = await passkit.sendPushNotification(
        programId,
        message,
        target_type === 'points_above'
          ? { loyaltyPointsMin: target_filter?.points ?? 0 }
          : undefined,
      );
      passkitSent = result.sent;
    } catch (err) {
      passkitError = err instanceof Error ? err.message : String(err);
      console.error('PassKit sendPushNotification error:', passkitError);
    }
  } else {
    console.warn('No passkit_program_id configured — skipping PassKit push notification');
  }

  // ---------------------------------------------------------------------------
  // Insert notification_recipients
  // ---------------------------------------------------------------------------
  const recipientRows = customerIds.map((cid) => {
    const wc = (walletCards ?? []).find(
      (w: { customer_id: string; id: string }) => w.customer_id === cid,
    );
    return {
      notification_id: notificationId,
      customer_id: cid,
      wallet_card_id: wc?.id ?? null,
      status: passkitError ? 'failed' : 'sent',
      error_message: passkitError,
      sent_at: passkitError ? null : new Date().toISOString(),
    };
  });

  if (recipientRows.length > 0) {
    await supabase.from('notification_recipients').insert(recipientRows);
  }

  // ---------------------------------------------------------------------------
  // Update notification status
  // ---------------------------------------------------------------------------
  await supabase
    .from('notifications')
    .update({
      status: passkitError ? 'failed' : 'sent',
      sent_at: passkitError ? null : new Date().toISOString(),
      recipients_count: customerIds.length,
    })
    .eq('id', notificationId);

  // Log passkit operation
  await supabase.from('passkit_operations').insert({
    merchant_id,
    operation_type: 'send_notification',
    status: passkitError ? 'failed' : 'success',
    request_payload: { title, message, target_type, target_filter } as unknown as Record<string, unknown>,
    response_payload: passkitError
      ? null
      : ({ sent: passkitSent } as unknown as Record<string, unknown>),
    error_message: passkitError,
    created_by: user.id,
  });

  return jsonResponse({
    success: !passkitError,
    recipients_count: customerIds.length,
    notification_id: notificationId,
    passkit_sent: passkitSent,
    ...(passkitError ? { passkit_error: passkitError } : {}),
  });
});
