import { supabase } from '@/lib/supabaseClient'
import type { Subscription } from '@/types/database'

// ─── getSubscription ──────────────────────────────────────────────────────────

export async function getSubscription(merchantId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('merchant_id', merchantId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer l'abonnement : ${error.message}`)
    }
    return data as Subscription
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la récupération de l'abonnement.")
  }
}

// ─── getAllSubscriptions ───────────────────────────────────────────────────────

export async function getAllSubscriptions(): Promise<Subscription[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer tous les abonnements : ${error.message}`)
    return (data ?? []) as Subscription[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération de tous les abonnements.')
  }
}

// ─── updateSubscription ───────────────────────────────────────────────────────

export async function updateSubscription(
  merchantId: string,
  data: Partial<Subscription>
): Promise<Subscription> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('merchant_id', merchantId)
      .select()
      .single()
    if (error) throw new Error(`Impossible de mettre à jour l'abonnement : ${error.message}`)
    return subscription as Subscription
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la mise à jour de l'abonnement.")
  }
}
