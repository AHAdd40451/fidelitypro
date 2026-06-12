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

    // Generate slug
    const slug =
      data.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)

    // 2. Create merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({
        name: data.businessName,
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        business_type: data.businessType,
        card_background_color: data.bgColor,
        card_text_color: data.textColor,
        accent_color: data.accentColor,
        welcome_message: data.welcomeMsg,
        slug,
        points_mode: 'amount_based' as const,
        status: 'active' as const,
      })
      .select()
      .single()
    if (merchantError) throw new Error(`Impossible de créer le commerce : ${merchantError.message}`)

    const merchantId = merchant.id

    // 3. Insert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: data.email,
        full_name: data.ownerName,
        role: 'merchant' as const,
        merchant_id: merchantId,
        status: 'active',
      })
      .select()
      .single()
    if (profileError) throw new Error(`Impossible de créer le profil : ${profileError.message}`)

    // 4. Insert merchant_settings (defaults)
    const { error: settingsError } = await supabase.from('merchant_settings').insert({
      merchant_id: merchantId,
      public_page_enabled: true,
      phone_required: true,
      email_required: false,
      apple_wallet_enabled: true,
      google_wallet_enabled: true,
    })
    if (settingsError) throw new Error(`Impossible de créer les paramètres : ${settingsError.message}`)

    // 5. Insert card_designs (defaults from merchant colors)
    const { error: cardDesignError } = await supabase.from('card_designs').insert({
      merchant_id: merchantId,
      background_color: data.bgColor,
      text_color: data.textColor,
      accent_color: data.accentColor,
      merchant_name_on_card: data.businessName,
      card_title: 'Carte de fidélité',
      points_label: 'Points',
      qr_label: 'Scanner pour gagner des points',
      sync_status: 'not_synced' as const,
    })
    if (cardDesignError) throw new Error(`Impossible de créer le design de carte : ${cardDesignError.message}`)

    // 6. Insert subscription (Free plan)
    const { error: subscriptionError } = await supabase.from('subscriptions').insert({
      merchant_id: merchantId,
      plan_name: 'Free',
      monthly_price: 0,
      status: 'free' as const,
      starts_at: new Date().toISOString(),
    })
    if (subscriptionError) throw new Error(`Impossible de créer l'abonnement : ${subscriptionError.message}`)

    return { user: authData.user, merchant: merchant as Merchant, profile: profile as Profile }
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
