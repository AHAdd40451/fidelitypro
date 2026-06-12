import { supabase } from '@/lib/supabaseClient'
import type { Offer, OfferRedemption } from '@/types/database'

// ─── getOffers ────────────────────────────────────────────────────────────────

export async function getOffers(merchantId: string): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer les offres : ${error.message}`)
    return (data ?? []) as Offer[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des offres.')
  }
}

// ─── getOfferById ─────────────────────────────────────────────────────────────

export async function getOfferById(id: string): Promise<Offer | null> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer l'offre : ${error.message}`)
    }
    return data as Offer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la récupération de l'offre.")
  }
}

// ─── createOffer ──────────────────────────────────────────────────────────────

export async function createOffer(data: {
  merchant_id: string
  label: string
  description?: string
  points_required: number
  status?: 'active' | 'inactive' | 'draft'
}): Promise<Offer> {
  try {
    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        merchant_id: data.merchant_id,
        label: data.label,
        description: data.description ?? null,
        points_required: data.points_required,
        status: data.status ?? 'active',
        times_redeemed: 0,
      })
      .select()
      .single()
    if (error) throw new Error(`Impossible de créer l'offre : ${error.message}`)
    return offer as Offer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la création de l'offre.")
  }
}

// ─── updateOffer ──────────────────────────────────────────────────────────────

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  try {
    const { data: offer, error } = await supabase
      .from('offers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Impossible de mettre à jour l'offre : ${error.message}`)
    return offer as Offer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la mise à jour de l'offre.")
  }
}

// ─── deleteOffer ──────────────────────────────────────────────────────────────

export async function deleteOffer(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('offers').delete().eq('id', id)
    if (error) throw new Error(`Impossible de supprimer l'offre : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la suppression de l'offre.")
  }
}

// ─── getRedemptions ───────────────────────────────────────────────────────────

export async function getRedemptions(merchantId: string): Promise<OfferRedemption[]> {
  try {
    const { data, error } = await supabase
      .from('offer_redemptions')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer les rachats : ${error.message}`)
    return (data ?? []) as OfferRedemption[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des rachats.')
  }
}
