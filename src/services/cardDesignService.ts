import { supabase } from '@/lib/supabaseClient'
import type { CardDesign } from '@/types/database'

// ─── getCardDesign ────────────────────────────────────────────────────────────

export async function getCardDesign(merchantId: string): Promise<CardDesign | null> {
  try {
    const { data, error } = await supabase
      .from('card_designs')
      .select('*')
      .eq('merchant_id', merchantId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer le design de carte : ${error.message}`)
    }
    return data as CardDesign
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération du design de carte.')
  }
}

// ─── updateCardDesign ─────────────────────────────────────────────────────────

export async function updateCardDesign(
  merchantId: string,
  data: Partial<CardDesign>
): Promise<CardDesign> {
  try {
    // Check if a record already exists
    const { data: existing } = await supabase
      .from('card_designs')
      .select('id')
      .eq('merchant_id', merchantId)
      .single()

    let result
    if (existing?.id) {
      // Update existing record
      const { data: updated, error } = await supabase
        .from('card_designs')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('merchant_id', merchantId)
        .select()
        .single()
      if (error) throw new Error(`Impossible de mettre à jour le design de carte : ${error.message}`)
      result = updated
    } else {
      // Insert new record
      const { data: inserted, error } = await supabase
        .from('card_designs')
        .insert({ ...data, merchant_id: merchantId })
        .select()
        .single()
      if (error) throw new Error(`Impossible de créer le design de carte : ${error.message}`)
      result = inserted
    }

    return result as CardDesign
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la mise à jour du design de carte.')
  }
}

// ─── pushCardDesignToPassKit ──────────────────────────────────────────────────

export async function pushCardDesignToPassKit(
  merchantId: string,
  cardDesign: Partial<CardDesign>
): Promise<{ success: boolean; synced_at: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('passkit-push-card-design', {
      body: { merchant_id: merchantId, card_design: cardDesign },
    })
    if (error) throw new Error(`Impossible de pousser le design vers PassKit : ${error.message}`)
    return data as { success: boolean; synced_at: string }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la synchronisation du design avec PassKit.')
  }
}
