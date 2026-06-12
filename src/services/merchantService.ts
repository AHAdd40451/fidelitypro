import { supabase } from '@/lib/supabaseClient'
import type { Merchant, MerchantInsert } from '@/types/database'

// ─── Public page view type ───────────────────────────────────────────────────

export interface PublicMerchantView {
  name: string
  logo_url: string | null
  card_background_color: string | null
  card_text_color: string | null
  accent_color: string | null
  welcome_message: string | null
  slug: string
  apple_wallet_enabled: boolean
  google_wallet_enabled: boolean
  public_page_enabled: boolean
}

// ─── getMerchants ─────────────────────────────────────────────────────────────

export async function getMerchants(): Promise<Merchant[]> {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer les commerces : ${error.message}`)
    return (data ?? []) as Merchant[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des commerces.')
  }
}

// ─── getMerchantById ──────────────────────────────────────────────────────────

export async function getMerchantById(id: string): Promise<Merchant | null> {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer le commerce : ${error.message}`)
    }
    return data as Merchant
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération du commerce.')
  }
}

// ─── getMerchantBySlug ────────────────────────────────────────────────────────

export async function getMerchantBySlug(slug: string): Promise<PublicMerchantView | null> {
  try {
    const { data, error } = await supabase.rpc('get_public_merchant_by_slug', { slug })
    if (error) throw new Error(`Impossible de récupérer le commerce par slug : ${error.message}`)
    if (!data) return null
    return data as PublicMerchantView
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération du commerce par slug.')
  }
}

// ─── getMyMerchant ────────────────────────────────────────────────────────────

export async function getMyMerchant(): Promise<Merchant | null> {
  try {
    const { data: merchantId, error: rpcError } = await supabase.rpc('get_my_merchant_id')
    if (rpcError) throw new Error(`Impossible de récupérer l'ID du commerce : ${rpcError.message}`)
    if (!merchantId) return null

    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer le commerce : ${error.message}`)
    }
    return data as Merchant
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération de votre commerce.')
  }
}

// ─── createMerchant ───────────────────────────────────────────────────────────

export async function createMerchant(data: MerchantInsert): Promise<Merchant> {
  try {
    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert(data)
      .select()
      .single()
    if (error) throw new Error(`Impossible de créer le commerce : ${error.message}`)
    return merchant as Merchant
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la création du commerce.')
  }
}

// ─── updateMerchant ───────────────────────────────────────────────────────────

export async function updateMerchant(id: string, data: Partial<Merchant>): Promise<Merchant> {
  try {
    const { data: merchant, error } = await supabase
      .from('merchants')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Impossible de mettre à jour le commerce : ${error.message}`)
    return merchant as Merchant
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la mise à jour du commerce.')
  }
}

// ─── suspendMerchant ──────────────────────────────────────────────────────────

export async function suspendMerchant(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('merchants')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`Impossible de suspendre le commerce : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la suspension du commerce.')
  }
}

// ─── activateMerchant ─────────────────────────────────────────────────────────

export async function activateMerchant(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('merchants')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`Impossible d'activer le commerce : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'activation du commerce.")
  }
}

// ─── deleteMerchant ───────────────────────────────────────────────────────────

export async function deleteMerchant(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('merchants').delete().eq('id', id)
    if (error) throw new Error(`Impossible de supprimer le commerce : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la suppression du commerce.')
  }
}
