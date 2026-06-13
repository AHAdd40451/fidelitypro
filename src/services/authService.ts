import { supabase } from '@/lib/supabaseClient'
import type { Profile, Merchant } from '@/types/database'

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<{ user: ReturnType<typeof supabase.auth.getUser> extends Promise<infer T> ? T extends { data: { user: infer U } } ? U : never : never; profile: Profile }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) throw new Error(`Échec de la connexion : ${authError.message}`)
    if (!authData.user) throw new Error('Aucun utilisateur retourné après la connexion.')

    const { data: profile, error: profileError } = await supabase.rpc('get_current_profile')
    if (profileError) throw new Error(`Impossible de récupérer le profil : ${profileError.message}`)

    return { user: authData.user as any, profile: profile as Profile }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la connexion.')
  }
}

// ─── Signup Merchant ─────────────────────────────────────────────────────────

export async function signupMerchant(data: {
  email: string
  password: string
  businessName: string
  ownerName: string
  phone: string
  businessType: string
  bgColor: string
  textColor: string
  accentColor: string
  welcomeMsg: string
}): Promise<{ user: any; merchant: Merchant; profile: Profile }> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (authError) throw new Error(`Échec de l'inscription : ${authError.message}`)
    if (!authData.user) throw new Error("Aucun utilisateur retourné après l'inscription.")

    const userId = authData.user.id

    // Create all merchant records via SECURITY DEFINER RPC.
    // This bypasses RLS and works whether email confirmation is enabled or not,
    // because the anon role can call the function even without a session.
    const { data: rpcResult, error: rpcError } = await supabase.rpc('signup_merchant', {
      p_user_id:       userId,
      p_email:         data.email,
      p_business_name: data.businessName,
      p_owner_name:    data.ownerName,
      p_phone:         data.phone,
      p_business_type: data.businessType,
      p_bg_color:      data.bgColor,
      p_text_color:    data.textColor,
      p_accent_color:  data.accentColor,
      p_welcome_msg:   data.welcomeMsg,
    })
    if (rpcError) throw new Error(`Impossible de créer le compte : ${rpcError.message}`)

    return { user: authData.user, merchant: { id: rpcResult.merchant_id } as Merchant, profile: { id: userId } as Profile }
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error("Erreur inattendue lors de l'inscription.")
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(`Échec de la déconnexion : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la déconnexion.')
  }
}

// ─── Get Current User ────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<{ user: any; profile: Profile } | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) return null

    const { data: profile, error: profileError } = await supabase.rpc('get_current_profile')
    if (profileError || !profile) return null

    return { user: userData.user, profile: profile as Profile }
  } catch {
    return null
  }
}

// ─── Reset Password Request ───────────────────────────────────────────────────

export async function resetPasswordRequest(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reinitialiser-mot-de-passe',
    })
    if (error) throw new Error(`Échec de la demande de réinitialisation : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la demande de réinitialisation.')
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(`Échec de la réinitialisation du mot de passe : ${error.message}`)
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Erreur inattendue lors de la réinitialisation du mot de passe.')
  }
}
