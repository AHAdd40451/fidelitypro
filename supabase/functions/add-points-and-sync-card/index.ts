// Edge Function: add-points-and-sync-card
// Adds loyalty points to a customer and syncs the updated balance
// to their PassKit wallet cards. Requires JWT auth (merchant role).

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { PassKitClient } from '../_shared/passkit-client.ts';

interface RequestBody {
  qr_code_token?: string;
  customer_id?: string;
  amount_paid?: number;
  fixed_points?: number;
  mode?: 'amount_based' | 'fixed_visit';
}

Deno.serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ---------------------------------------------------------------------------
  // Authenticate — merchant role required
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

  // Load profile and enforce merchant role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, merchant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return errorResponse('Profile not found', 403);
  }

  if (profile.role !== 'merchant' && profile.role !== 'admin') {
    return errorResponse('Forbidden: merchant role required', 403);
  }

  const merchantId = profile.merchant_id as string | null;
  if (!merchantId) {
    return errorResponse('No merchant associated with this account', 403);
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

  const { qr_code_token, customer_id, amount_paid, fixed_points, mode } = body;

  if (!qr_code_token && !customer_id) {
    return errorResponse('qr_code_token or customer_id is required', 400);
  }

  // ---------------------------------------------------------------------------
  // Find customer — verify they belong to this merchant
  // ---------------------------------------------------------------------------
  let customerQuery = supabase
    .from('customers')
    .select('id, qr_code_token, first_name, points_balance, merchant_id')
    .eq('merchant_id', merchantId);

  if (qr_code_token) {
    customerQuery = customerQuery.eq('qr_code_token', qr_code_token);
  } else {
    customerQuery = customerQuery.eq('id', customer_id!);
  }

  const { data: customer, error: customerError } = await customerQuery.single();

  if (customerError || !customer) {
    return errorResponse('Customer not found or does not belong to your merchant account', 404);
  }

  // ---------------------------------------------------------------------------
  // Load merchant to determine points mode and rates
  // ---------------------------------------------------------------------------
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, points_mode, points_per_euro, fixed_points_per_visit')
    .eq('id', merchantId)
    .single();

  if (merchantError || !merchant) {
    return errorResponse('Merchant record not found', 500);
  }

  // ---------------------------------------------------------------------------
  // Calculate points to add
  // ---------------------------------------------------------------------------
  const effectiveMode = mode ?? merchant.points_mode;
  let pointsToAdd = 0;
  let description = '';

  if (effectiveMode === 'fixed_visit') {
    pointsToAdd = fixed_points ?? merchant.fixed_points_per_visit;
    description = `Visite: +${pointsToAdd} points`;
  } else {
    // amount_based
    if (typeof amount_paid !== 'number' || amount_paid <= 0) {
      return errorResponse('amount_paid is required and must be positive for amount_based mode', 400);
    }
    pointsToAdd = Math.floor(amount_paid * merchant.points_per_euro);
    description = `Achat de ${amount_paid.toFixed(2)}€: +${pointsToAdd} points`;
  }

  if (pointsToAdd <= 0) {
    return errorResponse('Calculated points must be greater than 0', 400);
  }

  // ---------------------------------------------------------------------------
  // Call DB function to add points atomically
  // ---------------------------------------------------------------------------
  const { data: txResult, error: txError } = await supabase
    .rpc('add_customer_points', {
      p_customer_id: customer.id,
      p_merchant_id: merchantId,
      p_amount_paid: amount_paid ?? null,
      p_points_to_add: pointsToAdd,
      p_transaction_type: 'earn',
      p_description: description,
    });

  if (txError || !txResult) {
    console.error('add_customer_points RPC error:', txError);
    return errorResponse('Failed to record points transaction', 500);
  }

  const newBalance: number = txResult.new_balance;

  // ---------------------------------------------------------------------------
  // Sync PassKit wallet cards (best-effort, non-blocking on failure)
  // ---------------------------------------------------------------------------
  let walletSynced = false;
  let walletSyncFailed = false;

  try {
    // Load active wallet cards for this customer
    const { data: walletCards } = await supabase
      .from('wallet_cards')
      .select('id, provider, passkit_pass_id')
      .eq('customer_id', customer.id)
      .eq('merchant_id', merchantId)
      .in('status', ['active', 'pending']);

    if (walletCards && walletCards.length > 0) {
      const passkit = new PassKitClient();
      let synced = 0;

      for (const card of walletCards) {
        if (!card.passkit_pass_id) continue;
        try {
          await passkit.updateCardPoints(
            card.passkit_pass_id,
            newBalance,
            customer.qr_code_token,
          );

          await supabase
            .from('wallet_cards')
            .update({
              last_synced_at: new Date().toISOString(),
              last_error: null,
              status: 'active',
            })
            .eq('id', card.id);

          await supabase.from('passkit_operations').insert({
            merchant_id: merchantId,
            customer_id: customer.id,
            wallet_card_id: card.id,
            operation_type: 'update_card',
            provider: card.provider,
            status: 'success',
            request_payload: {
              passId: card.passkit_pass_id,
              points: newBalance,
            },
            created_by: user.id,
          });

          synced++;
        } catch (cardErr) {
          const errMsg = cardErr instanceof Error ? cardErr.message : String(cardErr);
          console.error(`PassKit sync failed for card ${card.id}:`, errMsg);

          await supabase.from('wallet_cards').update({ last_error: errMsg }).eq('id', card.id);
          await supabase.from('passkit_operations').insert({
            merchant_id: merchantId,
            customer_id: customer.id,
            wallet_card_id: card.id,
            operation_type: 'update_card',
            provider: card.provider,
            status: 'failed',
            error_message: errMsg,
            created_by: user.id,
          });
        }
      }

      walletSynced = synced > 0;
      walletSyncFailed = synced < walletCards.filter((c) => !!c.passkit_pass_id).length;
    } else {
      // No wallet cards yet — that is fine
      walletSynced = false;
    }
  } catch (syncErr) {
    console.error('Wallet sync error:', syncErr);
    walletSyncFailed = true;
  }

  // ---------------------------------------------------------------------------
  // Return success response
  // ---------------------------------------------------------------------------
  return jsonResponse({
    success: true,
    points_added: pointsToAdd,
    new_balance: newBalance,
    transaction_id: txResult.transaction_id,
    customer: {
      id: customer.id,
      first_name: customer.first_name,
      qr_code_token: customer.qr_code_token,
    },
    wallet_synced: walletSynced,
    ...(walletSyncFailed ? { wallet_sync_failed: true } : {}),
  });
});
