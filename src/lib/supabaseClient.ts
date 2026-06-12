import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[FidélityPro] Supabase env vars missing — running in offline/mock mode')
}

export const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'placeholder')
