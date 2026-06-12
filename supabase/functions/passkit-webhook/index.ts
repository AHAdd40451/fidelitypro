// Edge Function: passkit-webhook
// Receives and processes inbound webhooks from PassKit.
// No JWT auth — PassKit calls this endpoint directly.
// Optionally validates X-PassKit-Signature header.

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

// PassKit event types we handle
type PassKitEventType = 'pass.installed' | 'pass.removed' | 'pass.updated';

interface PassKitWebhookEvent {
  event: PassKitEventType;
  passId?: string;
  serialNumber?: string;
  programId?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

/**
 * Validate the HMAC-SHA256 signature sent by PassKit in the
 * X-PassKit-Signature header. Returns true if the secret is not
 * configured (disabled) or if the signature matches.
 */
async function validateSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = Deno.env.get('PASSKIT_WEBHOOK_SECRET');
  if (!secret) {
    // Signature validation is not configured — skip
    return true;
  }

  if (!signatureHeader) {
    console.warn('Missing X-PassKit-Signature header');
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison not strictly available here but sufficient for
  // webhook validation purposes.
  return expected === signatureHeader.toLowerCase().replace(/^sha256=/, '');
}

Deno.serve(async (req: Request) => {
  // Webhooks from PassKit use POST; allow CORS for browser testing
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ---------------------------------------------------------------------------
  // Read raw body (needed for signature validation)
  // ---------------------------------------------------------------------------
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('X-PassKit-Signature');

  // ---------------------------------------------------------------------------
  // Validate signature
  // ---------------------------------------------------------------------------
  const isValid = await validateSignature(rawBody, signatureHeader);
  if (!isValid) {
    console.error('Invalid PassKit webhook signature');
    return errorResponse('Invalid signature', 401);
  }

  // ---------------------------------------------------------------------------
  // Parse event body
  // ---------------------------------------------------------------------------
  let event: PassKitWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PassKitWebhookEvent;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!event.event) {
    return errorResponse('Missing event type', 400);
  }

  const supabase = createAdminClient();

  // ---------------------------------------------------------------------------
  // Log raw webhook to passkit_operations
  // ---------------------------------------------------------------------------
  const { data: opRow } = await supabase
    .from('passkit_operations')
    .insert({
      operation_type: 'webhook',
      status: 'pending',
      request_payload: event as unknown as Record<string, unknown>,
    })
    .select('id')
    .single();

  const opId = opRow?.id;

  // ---------------------------------------------------------------------------
  // Find the relevant wallet_card by passkit_pass_id or passkit_serial
  // ---------------------------------------------------------------------------
  let walletCardId: string | null = null;
  let customerId: string | null = null;
  let merchantId: string | null = null;

  if (event.passId || event.serialNumber) {
    let cardQuery = supabase
      .from('wallet_cards')
      .select('id, customer_id, merchant_id, status');

    if (event.passId) {
      cardQuery = cardQuery.eq('passkit_pass_id', event.passId);
    } else if (event.serialNumber) {
      cardQuery = cardQuery.eq('passkit_serial', event.serialNumber);
    }

    const { data: card } = await cardQuery.single();

    if (card) {
      walletCardId = card.id;
      customerId = card.customer_id;
      merchantId = card.merchant_id;
    }
  }

  // ---------------------------------------------------------------------------
  // Handle event types
  // ---------------------------------------------------------------------------
  let newStatus: string | null = null;

  switch (event.event) {
    case 'pass.installed':
      newStatus = 'active';
      console.log(`Pass installed: passId=${event.passId}, cardId=${walletCardId}`);
      break;

    case 'pass.removed':
      newStatus = 'suspended';
      console.log(`Pass removed: passId=${event.passId}, cardId=${walletCardId}`);
      break;

    case 'pass.updated':
      // No status change — just log
      console.log(`Pass updated: passId=${event.passId}, cardId=${walletCardId}`);
      break;

    default:
      console.warn(`Unhandled PassKit event type: ${event.event}`);
  }

  // Update wallet_cards status if applicable
  if (walletCardId && newStatus) {
    await supabase
      .from('wallet_cards')
      .update({
        status: newStatus,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', walletCardId);

    // If pass removed, also update customer wallet_status
    if (newStatus === 'suspended' && customerId) {
      // Only set to suspended if no other active cards remain
      const { data: remainingActive } = await supabase
        .from('wallet_cards')
        .select('id')
        .eq('customer_id', customerId)
        .eq('status', 'active');

      if (!remainingActive || remainingActive.length === 0) {
        await supabase
          .from('customers')
          .update({ wallet_status: 'suspended' })
          .eq('id', customerId);
      }
    }

    if (newStatus === 'active' && customerId) {
      await supabase
        .from('customers')
        .update({ wallet_status: 'active' })
        .eq('id', customerId);
    }
  }

  // ---------------------------------------------------------------------------
  // Update passkit_operations record to success
  // ---------------------------------------------------------------------------
  if (opId) {
    await supabase
      .from('passkit_operations')
      .update({
        merchant_id: merchantId,
        customer_id: customerId,
        wallet_card_id: walletCardId,
        status: 'success',
        response_payload: { event: event.event, handled: true } as unknown as Record<string, unknown>,
      })
      .eq('id', opId);
  }

  return jsonResponse({ received: true });
});
