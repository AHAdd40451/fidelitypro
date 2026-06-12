import { supabase } from '@/lib/supabaseClient'
import type { Notification, NotificationTargetType } from '@/types/database'

// ─── getNotifications ─────────────────────────────────────────────────────────

export async function getNotifications(merchantId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Impossible de récupérer les notifications : ${error.message}`)
    return (data ?? []) as Notification[]
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la récupération des notifications.')
  }
}

// ─── createNotification ───────────────────────────────────────────────────────

export async function createNotification(data: {
  merchant_id: string
  title: string
  message: string
  target_type: NotificationTargetType
  target_filter?: Record<string, unknown>
}): Promise<Notification> {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        merchant_id: data.merchant_id,
        title: data.title,
        message: data.message,
        target_type: data.target_type,
        target_filter: data.target_filter ?? null,
        status: 'draft' as const,
      })
      .select()
      .single()
    if (error) throw new Error(`Impossible de créer la notification : ${error.message}`)
    return notification as Notification
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la création de la notification.')
  }
}

// ─── sendNotification ─────────────────────────────────────────────────────────

export async function sendNotification(
  notificationId: string,
  merchantId: string,
  title: string,
  message: string,
  targetType: string,
  targetFilter?: object
): Promise<{ recipients_count: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('passkit-send-notification', {
      body: {
        notification_id: notificationId,
        merchant_id: merchantId,
        title,
        message,
        target_type: targetType,
        target_filter: targetFilter ?? null,
      },
    })
    if (error) throw new Error(`Impossible d'envoyer la notification : ${error.message}`)
    return data as { recipients_count: number }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'envoi de la notification.")
  }
}

// ─── updateNotification ───────────────────────────────────────────────────────

export async function updateNotification(
  id: string,
  data: Partial<Notification>
): Promise<Notification> {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Impossible de mettre à jour la notification : ${error.message}`)
    return notification as Notification
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la mise à jour de la notification.')
  }
}

// ─── deleteNotification ───────────────────────────────────────────────────────

export async function deleteNotification(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw new Error(`Impossible de supprimer la notification : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la suppression de la notification.')
  }
}
