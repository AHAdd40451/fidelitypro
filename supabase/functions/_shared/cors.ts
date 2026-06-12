// Shared CORS headers for all Edge Functions
// Allow all origins for development; restrict in production via env var.

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-passkit-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * handleCors responds to CORS preflight OPTIONS requests.
 * Call this at the top of every Edge Function handler.
 *
 * @returns Response if it was a preflight (caller should return it immediately),
 *          or null if the request should continue processing.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
  return null;
}

/**
 * jsonResponse is a convenience wrapper that adds CORS headers to
 * every JSON response returned from an Edge Function.
 */
export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

/**
 * errorResponse returns a standardised error JSON response.
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
