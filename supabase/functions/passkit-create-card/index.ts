// Edge Function: passkit-create-card
// Creates wallet pass(es) for a customer via the PassKit API.
// Requires JWT auth — caller must be an admin or the merchant
// who owns the merchant_id.

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { PassKitClient, PassKitCardPayload } from '../_shared/passkit-client.ts';

interface RequestBody {
  merchant_id: string;
  customer_id: string;
  provider: 'apple' | 'google' | 'both';
}

Deno.serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ---------------------------------------------------------------------------
  // Authenticate — require a valid Supabase JWT
  // ---------------------------------------------------------------------------
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header', 401);
  }

  const supabase = createAdminClient();

  // Verify the JWT and get the calling user
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );
  if (authError || !user) {
    return errorResponse('Unauthorized', 401);
  }

  // Load caller's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, merchant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return errorResponse('Profile not found', 403);
  }

  // ---------------------------------------------------------------------------
  // Parse and validate body
  // ---------------------------------------------------------------------------
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { merchant_id, customer_id, provider } = body;

  if (!merchant_id || !customer_id || !provider) {
    return errorResponse('merchant_id, customer_id, and provider are required', 400);
  }

  // Authorization check
  if (
    profile.role !== 'admin' &&
    profile.merchant_id !== merchant_id
  ) {
    return errorResponse('Forbidden: you do not own this merchant', 403);
  }

  // ---------------------------------------------------------------------------
  // Load merchant, card_design, and customer
  // ---------------------------------------------------------------------------
  const [merchantRes, cardDesignRes, customerRes] = await Promise.all([
    supabase.from('merchants').select('*').eq('id', merchant_id).single(),
    supabase.from('card_designs').select('*').eq('merchant_id', merchant_id).single(),
    supabase.from('customers').select('*').eq('id', customer_id).single(),
  ]);

  if (merchantRes.error || !merchantRes.data) {
    return errorResponse('Merchant not found', 404);
  }
  if (cardDesignRes.error || !cardDesignRes.data) {
    return errorResponse('Card design not found — please configure the card design first', 404);
  }
  if (customerRes.error || !customerRes.data) {
    return errorResponse('Customer not found', 404);
  }

  const merchant = merchantRes.data;
  const cardDesign = cardDesignRes.data;
  const customer = customerRes.data;

  const passkit = new PassKitClient();
  const walletUrls: { apple?: string; google?: string } = {};
  const errors: string[] = [];

  const providers: Array<'apple' | 'google'> =
    provider === 'both' ? ['apple', 'google'] : [provider];

  // ---------------------------------------------------------------------------
  // Create wallet card for each provider
  // ---------------------------------------------------------------------------
  for (const prov of providers) {
    const payload: PassKitCardPayload = {
      merchantName: cardDesign.merchant_name_on_card,
      logoUrl: cardDesign.logo_url ?? merchant.logo_url ?? undefined,
      backgroundColor: cardDesign.background_color,
      textColor: cardDesign.text_color,
      accentColor: cardDesign.accent_color,
      customerName: customer.first_name,
      pointsBalance: customer.points_balance,
      qrCodeToken: customer.qr_code_token,
      programId: cardDesign.passkit_program_id ?? undefined,
      templateId:
        prov === 'apple'
          ? (cardDesign.apple_template_id ?? undefined)
          : (cardDesign.google_template_id ?? undefined),
      provider: prov,
    };

    try {
      const result = await passkit.createLoyaltyCard(payload);

      // Upsert wallet_cards record
      const { error: upsertError } = await supabase
        .from('wallet_cards')
        .upsert(
          {
            merchant_id,
            customer_id,
            provider: prov,
            passkit_pass_id: result.passId,
            passkit_serial: result.serialNumber ?? null,
            wallet_url: result.walletUrl,
            status: 'active',
            last_synced_at: new Date().toISOString(),
            last_error: null,
          },
          { onConflict: 'customer_id,provider' },
        );

      if (upsertError) {
        console.error(`wallet_cards upsert error (${prov}):`, upsertError);
      }

      // Log success
      await supabase.from('passkit_operations').insert({
        merchant_id,
        customer_id,
        operation_type: 'create_card',
        provider: prov,
        status: 'success',
        request_payload: payload as unknown as Record<string, unknown>,
        response_payload: result as unknown as Record<string, unknown>,
        created_by: user.id,
      });

      if (prov === 'apple') walletUrls.apple = result.walletUrl;
      if (prov === 'google') walletUrls.google = result.walletUrl;

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`PassKit createLoyaltyCard failed (${prov}):`, errMsg);
      errors.push(`${prov}: ${errMsg}`);

      // Update wallet_cards with error status
      await supabase
        .from('wallet_cards')
        .upsert(
          {
            merchant_id,
            customer_id,
            provider: prov,
            status: 'error',
            last_error: errMsg,
          },
          { onConflict: 'customer_id,provider' },
        );

      // Log failure
      await supabase.from('passkit_operations').insert({
        merchant_id,
        customer_id,
        operation_type: 'create_card',
        provider: prov,
        status: 'failed',
        error_message: errMsg,
        created_by: user.id,
      });
    }
  }

  if (errors.length === providers.length) {
    // All providers failed
    return errorResponse(`Failed to create wallet card(s): ${errors.join('; ')}`, 500);
  }

  return jsonResponse({
    success: true,
    customer_id,
    wallet_urls: walletUrls,
    errors: errors.length > 0 ? errors : undefined,
  });
});
