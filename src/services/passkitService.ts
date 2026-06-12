import { supabase } from '@/lib/supabaseClient'
import type { PasskitOperation, CardDesign, Merchant } from '@/types/database'

// ─── createCard ───────────────────────────────────────────────────────────────

export async function createCard(
  merchantId: string,
  customerId: string,
  provider: 'apple' | 'google' | 'both'
): Promise<{ wallet_urls: Record<string, string> }> {
  try {
    const { data, error } = await supabase.functions.invoke('passkit-create-card', {
      body: { merchant_id: merchantId, customer_id: customerId, provider },
    })
    if (error) throw new Error(`Impossible de créer la carte wallet : ${error.message}`)
    return data as { wallet_urls: Record<string, string> }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la création de la carte wallet.')
  }
}

// ─── updateCard ───────────────────────────────────────────────────────────────

export async function updateCard(
  customerId: string,
  merchantId: string
): Promise<{ success: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('passkit-update-card', {
      body: { customer_id: customerId, merchant_id: merchantId },
    })
    if (error) throw new Error(`Impossible de mettre à jour la carte wallet : ${error.message}`)
    return data as { success: boolean }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la mise à jour de la carte wallet.')
  }
}

// ─── pushCardDesign ───────────────────────────────────────────────────────────

export async function pushCardDesign(
  merchantId: string,
  cardDesign: object
): Promise<{ success: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('passkit-push-card-design', {
      body: { merchant_id: merchantId, card_design: cardDesign },
    })
    if (error) throw new Error(`Impossible de pousser le design vers PassKit : ${error.message}`)
    return data as { success: boolean }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la synchronisation du design avec PassKit.')
  }
}

// ─── sendNotification ─────────────────────────────────────────────────────────

export async function sendNotification(data: {
  merchant_id: string
  title: string
  message: string
  target_type: string
  target_filter?: object
}): Promise<{ recipients_count: number }> {
  try {
    const { data: result, error } = await supabase.functions.invoke('passkit-send-notification', {
      body: data,
    })
    if (error) throw new Error(`Impossible d'envoyer la notification : ${error.message}`)
    return result as { recipients_count: number }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'envoi de la notification.")
  }
}

// ─── testConnection ───────────────────────────────────────────────────────────

export async function testConnection(): Promise<{ connected: boolean; environment: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('passkit-test-connection', {
      body: {},
    })
    if (error) throw new Error(`Impossible de tester la connexion PassKit : ${error.message}`)
    return data as { connected: boolean; environment: string }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors du test de connexion PassKit.')
  }
}

// ─── getOperationLogs ─────────────────────────────────────────────────────────

export async function getOperationLogs(merchantId?: string): Promise<PasskitOperation[]> {
  try {
    let query = supabase
      .from('passkit_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (merchantId) {
      query = query.eq('merchant_id', merchantId)
    }

    const { data, error } = await query
    if (error) throw new Error(`Impossible de récupérer les logs d'opérations : ${error.message}`)
    return (data ?? []) as PasskitOperation[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la récupération des logs d'opérations.")
  }
}

// ─── getTemplates ─────────────────────────────────────────────────────────────

export interface PasskitTemplate {
  id: string
  name: string
  type: string
  merchant: string | null
  status: string | null
  lastSynced: string | null
}

export async function getTemplates(): Promise<PasskitTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('card_designs')
      .select(`
        id,
        sync_status,
        last_pushed_to_passkit_at,
        apple_template_id,
        google_template_id,
        merchant_name_on_card,
        merchants!inner(name)
      `)
      .order('last_pushed_to_passkit_at', { ascending: false })

    if (error) throw new Error(`Impossible de récupérer les templates : ${error.message}`)

    const templates: PasskitTemplate[] = []
    for (const row of data ?? []) {
      const merchantName = (row as any).merchants?.name ?? null

      if ((row as any).apple_template_id) {
        templates.push({
          id: (row as any).apple_template_id,
          name: `${(row as any).merchant_name_on_card ?? merchantName ?? 'Commerce'} (Apple)`,
          type: 'apple',
          merchant: merchantName,
          status: (row as any).sync_status ?? null,
          lastSynced: (row as any).last_pushed_to_passkit_at ?? null,
        })
      }

      if ((row as any).google_template_id) {
        templates.push({
          id: (row as any).google_template_id,
          name: `${(row as any).merchant_name_on_card ?? merchantName ?? 'Commerce'} (Google)`,
          type: 'google',
          merchant: merchantName,
          status: (row as any).sync_status ?? null,
          lastSynced: (row as any).last_pushed_to_passkit_at ?? null,
        })
      }
    }

    return templates
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des templates.')
  }
}
