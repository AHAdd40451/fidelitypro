import { supabase } from '@/lib/supabaseClient'
import type { Customer, PointsTransaction } from '@/types/database'

// ─── getCustomers ─────────────────────────────────────────────────────────────

export async function getCustomers(merchantId?: string): Promise<Customer[]> {
  try {
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (merchantId) {
      query = query.eq('merchant_id', merchantId)
    }

    const { data, error } = await query
    if (error) throw new Error(`Impossible de récupérer les clients : ${error.message}`)
    return (data ?? []) as Customer[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des clients.')
  }
}

// ─── getCustomerById ──────────────────────────────────────────────────────────

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer le client : ${error.message}`)
    }
    return data as Customer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération du client.')
  }
}

// ─── getCustomerByQrToken ─────────────────────────────────────────────────────

export async function getCustomerByQrToken(token: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('qr_code_token', token)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Impossible de récupérer le client par token QR : ${error.message}`)
    }
    return data as Customer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération du client par token QR.')
  }
}

// ─── createCustomer ───────────────────────────────────────────────────────────

export async function createCustomer(data: {
  merchant_id: string
  first_name: string
  phone: string
  email?: string
}): Promise<Customer> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        merchant_id: data.merchant_id,
        first_name: data.first_name,
        phone: data.phone,
        email: data.email ?? null,
        points_balance: 0,
        visits_count: 0,
        wallet_status: 'none' as const,
      })
      .select()
      .single()
    if (error) throw new Error(`Impossible de créer le client : ${error.message}`)
    return customer as Customer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la création du client.')
  }
}

// ─── updateCustomer ───────────────────────────────────────────────────────────

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Impossible de mettre à jour le client : ${error.message}`)
    return customer as Customer
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la mise à jour du client.')
  }
}

// ─── deleteCustomer ───────────────────────────────────────────────────────────

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw new Error(`Impossible de supprimer le client : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la suppression du client.')
  }
}

// ─── getCustomerTransactions ──────────────────────────────────────────────────

export async function getCustomerTransactions(customerId: string): Promise<PointsTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer les transactions du client : ${error.message}`)
    return (data ?? []) as PointsTransaction[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des transactions du client.')
  }
}
