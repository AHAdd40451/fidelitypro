// Edge Function: passkit-push-card-design
// Saves (upserts) a card design to the DB and pushes the updated
// design to PassKit templates. Requires JWT auth (admin or merchant
// who owns the merchant_id).

import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { PassKitClient } from '../_shared/passkit-client.ts';

interface RequestBody {
  merchant_id: string;
  card_design: {
    logo_url?: string;
    background_color?: string;
    text_color?: string;
    accent_color?: string;
    merchant_name_on_card: string;
    card_title?: string;
    card_description?: string;
    points_label?: string;
    qr_label?: string;
    apple_template_id?: string;
    google_template_id?: string;
    passkit_program_id?: string;
    passkit_template_id?: string;
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

  const { merchant_id, card_design } = body;

  if (!merchant_id || !card_design) {
    return errorResponse('merchant_id and card_design are required', 400);
  }

  if (!card_design.merchant_name_on_card) {
    return errorResponse('card_design.merchant_name_on_card is required', 400);
  }

  // Authorization check
  if (profile.role !== 'admin' && profile.merchant_id !== merchant_id) {
    return errorResponse('Forbidden: you do not own this merchant', 403);
  }

  // ---------------------------------------------------------------------------
  // Upsert card_design to DB
  // ---------------------------------------------------------------------------
  const now = new Date().toISOString();

  const { data: savedDesign, error: upsertError } = await supabase
    .from('card_designs')
    .upsert(
      {
        merchant_id,
        logo_url: card_design.logo_url ?? null,
        background_color: card_design.background_color ?? '#1e3a5f',
        text_color: card_design.text_color ?? '#ffffff',
        accent_color: card_design.accent_color ?? '#f0c040',
        merchant_name_on_card: card_design.merchant_name_on_card,
        card_title: card_design.card_title ?? 'Carte de fidélité',
        card_description: card_design.card_description ?? null,
        points_label: card_design.points_label ?? 'Points',
        qr_label: card_design.qr_label ?? 'Scanner pour ajouter des points',
        apple_template_id: card_design.apple_template_id ?? null,
        google_template_id: card_design.google_template_id ?? null,
        passkit_program_id: card_design.passkit_program_id ?? null,
        passkit_template_id: card_design.passkit_template_id ?? null,
        sync_status: 'syncing',
      },
      { onConflict: 'merchant_id' },
    )
    .select()
    .single();

  if (upsertError || !savedDesign) {
    console.error('card_designs upsert error:', upsertError);
    return errorResponse('Failed to save card design', 500);
  }

  // ---------------------------------------------------------------------------
  // Push to PassKit for Apple and Google templates
  // ---------------------------------------------------------------------------
  const passkit = new PassKitClient();
  const passkitPayload = {
    backgroundColor: savedDesign.background_color,
    foregroundColor: savedDesign.text_color,
    labelColor: savedDesign.accent_color,
    logoImage: savedDesign.logo_url,
    merchantName: savedDesign.merchant_name_on_card,
    cardTitle: savedDesign.card_title,
    description: savedDesign.card_description,
    pointsLabel: savedDesign.points_label,
    qrLabel: savedDesign.qr_label,
  };

  const pushErrors: string[] = [];

  // Push Apple template
  if (savedDesign.apple_template_id) {
    try {
      await passkit.pushDesignUpdate(savedDesign.apple_template_id, {
        ...passkitPayload,
        provider: 'apple',
      });

      await supabase.from('passkit_operations').insert({
        merchant_id,
        operation_type: 'push_design',
        provider: 'apple',
        status: 'success',
        request_payload: passkitPayload as unknown as Record<string, unknown>,
        created_by: user.id,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      pushErrors.push(`apple: ${errMsg}`);

      await supabase.from('passkit_operations').insert({
        merchant_id,
        operation_type: 'push_design',
        provider: 'apple',
        status: 'failed',
        error_message: errMsg,
        created_by: user.id,
      });
    }
  }

  // Push Google template
  if (savedDesign.google_template_id) {
    try {
      await passkit.pushDesignUpdate(savedDesign.google_template_id, {
        ...passkitPayload,
        provider: 'google',
      });

      await supabase.from('passkit_operations').insert({
        merchant_id,
        operation_type: 'push_design',
        provider: 'google',
        status: 'success',
        request_payload: passkitPayload as unknown as Record<string, unknown>,
        created_by: user.id,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      pushErrors.push(`google: ${errMsg}`);

      await supabase.from('passkit_operations').insert({
        merchant_id,
        operation_type: 'push_design',
        provider: 'google',
        status: 'failed',
        error_message: errMsg,
        created_by: user.id,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Update sync_status on card_designs
  // ---------------------------------------------------------------------------
  const hasBothTemplates = savedDesign.apple_template_id && savedDesign.google_template_id;
  const allFailed = pushErrors.length > 0 && pushErrors.length === (hasBothTemplates ? 2 : 1);

  await supabase
    .from('card_designs')
    .update({
      last_pushed_to_passkit_at: now,
      sync_status: allFailed ? 'error' : 'synced',
    })
    .eq('merchant_id', merchant_id);

  return jsonResponse({
    success: true,
    synced_at: now,
    card_design_id: savedDesign.id,
    push_errors: pushErrors.length > 0 ? pushErrors : undefined,
  });
});
