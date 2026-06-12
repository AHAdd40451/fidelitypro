import { supabase } from '@/lib/supabaseClient'

// ─── uploadMerchantLogo ───────────────────────────────────────────────────────

export async function uploadMerchantLogo(merchantId: string, file: File): Promise<string> {
  try {
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${merchantId}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('merchant-logos')
      .upload(path, file, { upsert: true })

    if (uploadError) throw new Error(`Impossible d'uploader le logo : ${uploadError.message}`)

    const { data } = supabase.storage.from('merchant-logos').getPublicUrl(path)
    if (!data?.publicUrl) throw new Error("Impossible d'obtenir l'URL publique du logo.")

    return data.publicUrl
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'upload du logo du commerce.")
  }
}

// ─── uploadCardAsset ──────────────────────────────────────────────────────────

export async function uploadCardAsset(
  merchantId: string,
  file: File,
  filename: string
): Promise<string> {
  try {
    const path = `${merchantId}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('card-assets')
      .upload(path, file, { upsert: true })

    if (uploadError) throw new Error(`Impossible d'uploader l'asset de carte : ${uploadError.message}`)

    const { data } = supabase.storage.from('card-assets').getPublicUrl(path)
    if (!data?.publicUrl) throw new Error("Impossible d'obtenir l'URL publique de l'asset.")

    return data.publicUrl
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'upload de l'asset de carte.")
  }
}

// ─── deleteFile ───────────────────────────────────────────────────────────────

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(`Impossible de supprimer le fichier : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la suppression du fichier.')
  }
}
