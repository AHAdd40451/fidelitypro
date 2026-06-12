import { supabase } from '@/lib/supabaseClient'
import type { Customer, PointsTransaction, TransactionType } from '@/types/database'

// ─── addPointsAndSyncCard ─────────────────────────────────────────────────────

export async function addPointsAndSyncCard(data: {
  qr_code_token?: string
  customer_id?: string
  amount_paid?: number
  fixed_points?: number
  mode?: string
}): Promise<{
  success: boolean
  points_added: number
  new_balance: number
  customer: Customer
  wallet_synced: boolean
  wallet_sync_failed?: boolean
}> {
  try {
    const { data: result, error } = await supabase.functions.invoke('add-points-and-sync-card', {
      body: data,
    })
    if (error) throw new Error(`Impossible d'ajouter des points et de synchroniser la carte : ${error.message}`)
    return result as {
      success: boolean
      points_added: number
      new_balance: number
      customer: Customer
      wallet_synced: boolean
      wallet_sync_failed?: boolean
    }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'ajout de points et de la synchronisation de la carte.")
  }
}

// ─── addPointsManual ──────────────────────────────────────────────────────────

export async function addPointsManual(
  customerId: string,
  merchantId: string,
  pointsToAdd: number,
  description?: string
): Promise<PointsTransaction> {
  try {
    const { data, error } = await supabase.rpc('add_customer_points', {
      p_customer_id: customerId,
      p_merchant_id: merchantId,
      p_points: pointsToAdd,
      p_type: 'adjust' as TransactionType,
      p_description: description ?? null,
    })
    if (error) throw new Error(`Impossible d'ajouter des points manuellement : ${error.message}`)
    return data as PointsTransaction
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'ajout manuel de points.")
  }
}

// ─── redeemOffer ──────────────────────────────────────────────────────────────

export async function redeemOffer(
  customerId: string,
  offerId: string,
  merchantId: string
): Promise<{ success: boolean; points_spent: number }> {
  try {
    const { data, error } = await supabase.rpc('redeem_customer_offer', {
      p_customer_id: customerId,
      p_offer_id: offerId,
      p_merchant_id: merchantId,
    })
    if (error) throw new Error(`Impossible de racheter l'offre : ${error.message}`)
    return data as { success: boolean; points_spent: number }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors du rachat de l'offre.")
  }
}

// ─── getTransactions ──────────────────────────────────────────────────────────

export async function getTransactions(
  merchantId?: string,
  customerId?: string
): Promise<PointsTransaction[]> {
  try {
    let query = supabase
      .from('points_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (merchantId) {
      query = query.eq('merchant_id', merchantId)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data, error } = await query
    if (error) throw new Error(`Impossible de récupérer les transactions : ${error.message}`)
    return (data ?? []) as PointsTransaction[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des transactions.')
  }
}
