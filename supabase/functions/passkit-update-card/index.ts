// Edge Function: passkit-update-card
// Syncs updated point balances to PassKit for all wallet cards
// belonging to a customer. Intended for internal use (called by
// add-points-and-sync-card or triggered after point changes).

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { PassKitClient } from '../_shared/passkit-client.ts';

interface RequestBody {
  customer_id: string;
  merchant_id: string;
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

  // ---------------------------------------------------------------------------
  // Parse body
  // ---------------------------------------------------------------------------
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { customer_id, merchant_id } = body;
  if (!customer_id || !merchant_id) {
    return errorResponse('customer_id and merchant_id are required', 400);
  }

  // ---------------------------------------------------------------------------
  // Load data
  // ---------------------------------------------------------------------------
  const [customerRes, walletCardsRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, qr_code_token, points_balance, merchant_id')
      .eq('id', customer_id)
      .eq('merchant_id', merchant_id)
      .single(),
    supabase
      .from('wallet_cards')
      .select('id, provider, passkit_pass_id, passkit_serial, status')
      .eq('customer_id', customer_id)
      .eq('merchant_id', merchant_id)
      .in('status', ['active', 'pending']),
  ]);

  if (customerRes.error || !customerRes.data) {
    return errorResponse('Customer not found', 404);
  }

  const customer = customerRes.data;
  const walletCards = walletCardsRes.data ?? [];

  if (walletCards.length === 0) {
    return jsonResponse({
      success: true,
      cards_updated: 0,
      message: 'No active wallet cards found for this customer',
    });
  }

  const passkit = new PassKitClient();
  let cardsUpdated = 0;

  // ---------------------------------------------------------------------------
  // Update each wallet card
  // ---------------------------------------------------------------------------
  for (const card of walletCards) {
    if (!card.passkit_pass_id) continue;

    try {
      await passkit.updateCardPoints(
        card.passkit_pass_id,
        customer.points_balance,
        customer.qr_code_token,
      );

      // Mark as synced
      await supabase
        .from('wallet_cards')
        .update({
          status: 'active',
          last_synced_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', card.id);

      // Log operation
      await supabase.from('passkit_operations').insert({
        merchant_id,
        customer_id,
        wallet_card_id: card.id,
        operation_type: 'update_card',
        provider: card.provider,
        status: 'success',
        request_payload: {
          passId: card.passkit_pass_id,
          points: customer.points_balance,
          qrCodeToken: customer.qr_code_token,
        },
        created_by: user.id,
      });

      cardsUpdated++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`PassKit updateCardPoints failed (card ${card.id}):`, errMsg);

      await supabase
        .from('wallet_cards')
        .update({ last_error: errMsg })
        .eq('id', card.id);

      await supabase.from('passkit_operations').insert({
        merchant_id,
        customer_id,
        wallet_card_id: card.id,
        operation_type: 'update_card',
        provider: card.provider,
        status: 'failed',
        error_message: errMsg,
        created_by: user.id,
      });
    }
  }

  return jsonResponse({
    success: true,
    cards_updated: cardsUpdated,
    total_cards: walletCards.length,
  });
});
