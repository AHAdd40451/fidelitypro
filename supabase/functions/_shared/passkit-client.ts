// PassKit API Client
// All endpoints are marked with TODO comments because exact PassKit API paths
// must be verified against the official PassKit API documentation once
// credentials are available.

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface PassKitCardPayload {
  merchantName: string;
  logoUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  customerName: string;
  pointsBalance: number;
  qrCodeToken: string;
  programId?: string;
  templateId?: string;
  provider: 'apple' | 'google';
}

export interface PassKitCardResponse {
  passId: string;
  serialNumber?: string;
  walletUrl: string;
}

export interface PassKitPushNotificationResult {
  sent: number;
}

export interface PassKitConnectionResult {
  connected: boolean;
  environment: string;
}

// ---------------------------------------------------------------------------
// PassKitClient class
// ---------------------------------------------------------------------------

export class PassKitClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl =
      Deno.env.get('PASSKIT_BASE_URL') ?? 'https://api.passkit.net';
    const key = Deno.env.get('PASSKIT_API_KEY');
    if (!key) {
      throw new Error('Missing environment variable: PASSKIT_API_KEY');
    }
    this.apiKey = key;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '(no body)');
      const err = `PassKit API error ${res.status} on ${method} ${path}: ${text}`;
      console.error(err);
      throw new Error(err);
    }

    const json = await res.json();
    return json as T;
  }

  // -------------------------------------------------------------------------
  // createLoyaltyCard
  // TODO: Verify exact PassKit API endpoint for creating a loyalty pass
  // -------------------------------------------------------------------------

  async createLoyaltyCard(
    payload: PassKitCardPayload,
  ): Promise<PassKitCardResponse> {
    // TODO: Verify exact PassKit API endpoint — e.g. POST /v2/pass/issue/template/{templateId}
    const templateId = payload.templateId ?? Deno.env.get('PASSKIT_DEFAULT_TEMPLATE_ID');
    if (!templateId) {
      throw new Error('templateId is required for createLoyaltyCard');
    }

    const requestBody = {
      templateId,
      programId: payload.programId,
      externalId: payload.qrCodeToken,
      person: {
        displayName: payload.customerName,
      },
      barcodes: [
        {
          message: payload.qrCodeToken,
          format: 'QR_CODE',
        },
      ],
      loyaltyPoints: payload.pointsBalance,
      design: {
        backgroundColor: payload.backgroundColor,
        foregroundColor: payload.textColor,
        labelColor: payload.accentColor,
        logoImage: payload.logoUrl,
        merchantName: payload.merchantName,
      },
    };

    // TODO: Verify exact PassKit API endpoint
    const response = await this.request<{
      id: string;
      serialNumber?: string;
      urls?: { wallet?: string; pkpass?: string };
    }>('POST', `/v2/pass/issue/template/${templateId}`, requestBody);

    return {
      passId: response.id,
      serialNumber: response.serialNumber,
      walletUrl: response.urls?.wallet ?? response.urls?.pkpass ?? '',
    };
  }

  // -------------------------------------------------------------------------
  // updateCardPoints
  // TODO: Verify exact PassKit API endpoint for updating pass fields
  // -------------------------------------------------------------------------

  async updateCardPoints(
    passId: string,
    points: number,
    qrToken: string,
  ): Promise<void> {
    // TODO: Verify exact PassKit API endpoint — e.g. PUT /v2/pass/{passId}
    await this.request('PUT', `/v2/pass/${passId}`, {
      loyaltyPoints: points,
      barcodes: [
        {
          message: qrToken,
          format: 'QR_CODE',
        },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // pushDesignUpdate
  // TODO: Verify exact PassKit API endpoint for pushing template design changes
  // -------------------------------------------------------------------------

  async pushDesignUpdate(
    templateId: string,
    payload: unknown,
  ): Promise<void> {
    // TODO: Verify exact PassKit API endpoint — e.g. PUT /v2/template/{templateId}
    await this.request('PUT', `/v2/template/${templateId}`, payload);
  }

  // -------------------------------------------------------------------------
  // sendPushNotification
  // TODO: Verify exact PassKit API endpoint for push notifications
  // -------------------------------------------------------------------------

  async sendPushNotification(
    programId: string,
    message: string,
    filters?: unknown,
  ): Promise<PassKitPushNotificationResult> {
    // TODO: Verify exact PassKit API endpoint — e.g. POST /v2/program/{programId}/notification
    const response = await this.request<{ sent?: number; count?: number }>(
      'POST',
      `/v2/program/${programId}/notification`,
      {
        message,
        filters: filters ?? {},
      },
    );

    return { sent: response.sent ?? response.count ?? 0 };
  }

  // -------------------------------------------------------------------------
  // testConnection
  // TODO: Verify exact PassKit API endpoint for connection health check
  // -------------------------------------------------------------------------

  async testConnection(): Promise<PassKitConnectionResult> {
    // TODO: Verify exact PassKit API endpoint — e.g. GET /v2/health or GET /v2/account
    const response = await this.request<{
      status?: string;
      environment?: string;
    }>('GET', '/v2/account');

    return {
      connected: !!response,
      environment:
        response.environment ?? Deno.env.get('PASSKIT_ENVIRONMENT') ?? 'sandbox',
    };
  }
}
