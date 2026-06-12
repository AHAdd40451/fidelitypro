// Edge Function: public-customer-signup
// Public endpoint — no JWT required.
// Allows a customer to register with a merchant's loyalty programme.

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

interface SignupBody {
  slug: string;
  first_name: string;
  phone: string;
  email?: string;
  wallet_provider?: 'apple' | 'google' | 'both';
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ---------------------------------------------------------------------------
  // Parse and validate body
  // ---------------------------------------------------------------------------
  let body: SignupBody;
  try {
    body = await req.json() as SignupBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { slug, first_name, phone, email, wallet_provider } = body;

  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return errorResponse('slug is required', 400);
  }
  if (!first_name || typeof first_name !== 'string' || first_name.trim() === '') {
    return errorResponse('first_name is required', 400);
  }
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return errorResponse('phone is required', 400);
  }

  const supabase = createAdminClient();

  // ---------------------------------------------------------------------------
  // Find merchant by slug with settings
  // ---------------------------------------------------------------------------
  const { data: merchantRows, error: merchantError } = await supabase
    .from('merchants')
    .select(`
      id,
      name,
      logo_url,
      card_background_color,
      card_text_color,
      accent_color,
      welcome_message,
      slug,
      status,
      merchant_settings (
        public_page_enabled,
        phone_required,
        email_required,
        apple_wallet_enabled,
        google_wallet_enabled
      )
    `)
    .eq('slug', slug.trim())
    .eq('status', 'active')
    .single();

  if (merchantError || !merchantRows) {
    console.error('Merchant lookup error:', merchantError);
    return errorResponse('Merchant not found or inactive', 404);
  }

  const settings = merchantRows.merchant_settings as {
    public_page_enabled: boolean;
    phone_required: boolean;
    email_required: boolean;
    apple_wallet_enabled: boolean;
    google_wallet_enabled: boolean;
  } | null;

  if (!settings?.public_page_enabled) {
    return errorResponse('Merchant public page is not enabled', 403);
  }

  // Validate email if required
  if (settings.email_required && (!email || email.trim() === '')) {
    return errorResponse('email is required for this merchant', 400);
  }

  // ---------------------------------------------------------------------------
  // Generate a unique QR token via DB function
  // ---------------------------------------------------------------------------
  const { data: qrToken, error: tokenError } = await supabase
    .rpc('generate_unique_qr_token');

  if (tokenError || !qrToken) {
    console.error('QR token generation error:', tokenError);
    return errorResponse('Failed to generate QR token', 500);
  }

  // ---------------------------------------------------------------------------
  // Insert customer record
  // ---------------------------------------------------------------------------
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      merchant_id: merchantRows.id,
      first_name: first_name.trim(),
      phone: phone.trim(),
      email: email?.trim() ?? null,
      qr_code_token: qrToken,
      points_balance: 0,
      visits_count: 0,
      wallet_status: 'pending',
    })
    .select('id, qr_code_token, first_name, phone, email, points_balance')
    .single();

  if (customerError || !customer) {
    console.error('Customer insert error:', customerError);
    // Handle duplicate phone for same merchant gracefully
    if (customerError?.code === '23505') {
      return errorResponse('A customer with this phone number is already registered.', 409);
    }
    return errorResponse('Failed to create customer record', 500);
  }

  // ---------------------------------------------------------------------------
  // Log page view / signup event
  // ---------------------------------------------------------------------------
  await supabase.from('public_page_views').insert({
    merchant_id: merchantRows.id,
    event_type: 'signup',
    metadata: { customer_id: customer.id, provider: wallet_provider ?? null },
  });

  // ---------------------------------------------------------------------------
  // Prepare wallet URLs
  // Wallet card creation is handled asynchronously by passkit-create-card.
  // We return placeholder wallet_urls here. The client should poll or listen
  // for the wallet_cards record to become active.
  // ---------------------------------------------------------------------------
  const walletUrls: { apple?: string; google?: string } = {};

  if (
    wallet_provider === 'apple' ||
    wallet_provider === 'both'
  ) {
    if (settings.apple_wallet_enabled) {
      // TODO: Trigger passkit-create-card asynchronously for Apple Wallet
      // For now return null — the client should call passkit-create-card
      walletUrls.apple = null as unknown as string;
    }
  }

  if (
    wallet_provider === 'google' ||
    wallet_provider === 'both'
  ) {
    if (settings.google_wallet_enabled) {
      // TODO: Trigger passkit-create-card asynchronously for Google Wallet
      walletUrls.google = null as unknown as string;
    }
  }

  // ---------------------------------------------------------------------------
  // Return success
  // ---------------------------------------------------------------------------
  return jsonResponse({
    success: true,
    customer_id: customer.id,
    qr_code_token: customer.qr_code_token,
    wallet_urls: walletUrls,
    merchant_name: merchantRows.name,
    message: `Bienvenue ${customer.first_name}! Votre carte de fidélité a été créée.`,
  }, 201);
});
