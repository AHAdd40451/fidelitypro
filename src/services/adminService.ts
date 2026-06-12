import { supabase } from '@/lib/supabaseClient'
import type { AuditLog, PasskitConfig, Profile } from '@/types/database'

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  active_merchants: number
  total_merchants: number
  total_customers: number
  total_wallet_cards: number
  total_points_distributed: number
  monthly_revenue: number
}

export interface MerchantStats {
  total_customers: number
  total_points_distributed: number
  total_visits: number
  active_offers: number
  notifications_sent: number
}

// ─── getDashboardStats ────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const { data, error } = await supabase
      .from('admin_stats_view')
      .select('*')
      .single()
    if (error) throw new Error(`Impossible de récupérer les statistiques du tableau de bord : ${error.message}`)
    return data as AdminDashboardStats
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des statistiques du tableau de bord.')
  }
}

// ─── getMerchantStats ─────────────────────────────────────────────────────────

export async function getMerchantStats(merchantId: string): Promise<MerchantStats> {
  try {
    const { data, error } = await supabase
      .from('merchant_stats_view')
      .select('*')
      .eq('merchant_id', merchantId)
      .single()
    if (error) throw new Error(`Impossible de récupérer les statistiques du commerce : ${error.message}`)
    return data as MerchantStats
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des statistiques du commerce.')
  }
}

// ─── getAuditLogs ─────────────────────────────────────────────────────────────

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(`Impossible de récupérer les logs d'audit : ${error.message}`)
    return (data ?? []) as AuditLog[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de la récupération des logs d'audit.")
  }
}

// ─── getPasskitConfig ─────────────────────────────────────────────────────────

export async function getPasskitConfig(): Promise<PasskitConfig | null> {
  try {
    const { data, error } = await supabase
      .from('passkit_configs')
      .select('*')
      .limit(1)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer la configuration PassKit : ${error.message}`)
    }
    return data as PasskitConfig
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération de la configuration PassKit.')
  }
}

// ─── updatePasskitConfig ──────────────────────────────────────────────────────

export async function updatePasskitConfig(data: Partial<PasskitConfig>): Promise<PasskitConfig> {
  try {
    // Fetch existing config to get its ID
    const { data: existing, error: fetchError } = await supabase
      .from('passkit_configs')
      .select('id')
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Impossible de récupérer la configuration PassKit : ${fetchError.message}`)
    }

    let result
    if (existing?.id) {
      const { data: updated, error } = await supabase
        .from('passkit_configs')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw new Error(`Impossible de mettre à jour la configuration PassKit : ${error.message}`)
      result = updated
    } else {
      const { data: inserted, error } = await supabase
        .from('passkit_configs')
        .insert(data)
        .select()
        .single()
      if (error) throw new Error(`Impossible de créer la configuration PassKit : ${error.message}`)
      result = inserted
    }

    return result as PasskitConfig
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la mise à jour de la configuration PassKit.')
  }
}

// ─── getAdminUsers ────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer les administrateurs : ${error.message}`)
    return (data ?? []) as Profile[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des administrateurs.')
  }
}
