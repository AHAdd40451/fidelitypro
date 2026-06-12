// ─── Enum / String Literal Types ────────────────────────────────────────────

export type UserRole = 'merchant' | 'admin'
export type PointsMode = 'amount_based' | 'fixed_visit'
export type MerchantStatus = 'active' | 'suspended' | 'pending'
export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'cancelled' | 'trialing'
export type WalletProvider = 'apple' | 'google'
export type WalletStatus = 'none' | 'apple' | 'google' | 'both'
export type WalletCardStatus = 'active' | 'inactive' | 'expired' | 'revoked'
export type TransactionType = 'earn' | 'redeem' | 'adjust' | 'bonus'
export type OfferStatus = 'active' | 'inactive' | 'draft'
export type NotificationStatus = 'draft' | 'sent' | 'failed' | 'sending'
export type NotificationTargetType = 'all' | 'segment' | 'individual'
export type PasskitSyncStatus = 'synced' | 'pending' | 'error' | 'not_synced'
export type PasskitOperationType =
  | 'create_card'
  | 'update_card'
  | 'revoke_card'
  | 'push_design'
  | 'send_notification'
  | 'test_connection'
export type PasskitOperationStatus = 'pending' | 'success' | 'failed'
export type PasskitEnvironment = 'sandbox' | 'production'
export type PasskitConfigStatus = 'active' | 'inactive' | 'error'

// ─── Table Interfaces ────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  merchant_id: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export interface Merchant {
  id: string
  name: string
  owner_name: string | null
  email: string | null
  phone: string | null
  business_type: string | null
  logo_url: string | null
  card_background_color: string | null
  card_text_color: string | null
  accent_color: string | null
  welcome_message: string | null
  slug: string
  points_mode: PointsMode
  points_per_euro: number | null
  fixed_points_per_visit: number | null
  subscription_status: SubscriptionStatus | null
  status: MerchantStatus
  created_at: string
  updated_at: string
}

export interface MerchantSettings {
  id: string
  merchant_id: string
  public_page_enabled: boolean
  phone_required: boolean
  email_required: boolean
  custom_welcome_message: string | null
  apple_wallet_enabled: boolean
  google_wallet_enabled: boolean
  created_at: string
  updated_at: string
}

export interface CardDesign {
  id: string
  merchant_id: string
  logo_url: string | null
  background_color: string | null
  text_color: string | null
  accent_color: string | null
  merchant_name_on_card: string | null
  card_title: string | null
  card_description: string | null
  points_label: string | null
  qr_label: string | null
  apple_template_id: string | null
  google_template_id: string | null
  passkit_program_id: string | null
  passkit_template_id: string | null
  last_pushed_to_passkit_at: string | null
  sync_status: PasskitSyncStatus | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  merchant_id: string
  first_name: string
  phone: string | null
  email: string | null
  qr_code_token: string
  points_balance: number
  visits_count: number
  last_visit_at: string | null
  apple_pass_serial: string | null
  google_wallet_id: string | null
  wallet_status: WalletStatus
  created_at: string
  updated_at: string
}

export interface WalletCard {
  id: string
  merchant_id: string
  customer_id: string
  provider: WalletProvider
  passkit_pass_id: string | null
  passkit_serial: string | null
  wallet_url: string | null
  status: WalletCardStatus
  last_synced_at: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface PointsTransaction {
  id: string
  merchant_id: string
  customer_id: string
  type: TransactionType
  amount_paid: number | null
  points_added: number | null
  points_removed: number | null
  balance_after: number
  description: string | null
  created_by: string | null
  created_at: string
}

export interface Offer {
  id: string
  merchant_id: string
  label: string
  description: string | null
  points_required: number
  status: OfferStatus
  times_redeemed: number
  created_at: string
  updated_at: string
}

export interface OfferRedemption {
  id: string
  merchant_id: string
  offer_id: string
  customer_id: string
  points_spent: number
  redeemed_by: string | null
  created_at: string
}

export interface Notification {
  id: string
  merchant_id: string
  title: string
  message: string
  target_type: NotificationTargetType
  target_filter: Record<string, unknown> | null
  recipients_count: number | null
  status: NotificationStatus
  sent_by: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationRecipient {
  id: string
  notification_id: string
  customer_id: string
  wallet_card_id: string | null
  status: string | null
  error_message: string | null
  sent_at: string | null
}

export interface Subscription {
  id: string
  merchant_id: string
  plan_name: string
  monthly_price: number | null
  status: SubscriptionStatus
  starts_at: string | null
  renews_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface PasskitConfig {
  id: string
  environment: PasskitEnvironment
  status: PasskitConfigStatus
  default_apple_template_id: string | null
  default_google_template_id: string | null
  webhook_url: string | null
  last_tested_at: string | null
  created_at: string
  updated_at: string
}

export interface PasskitOperation {
  id: string
  merchant_id: string | null
  customer_id: string | null
  wallet_card_id: string | null
  operation_type: PasskitOperationType
  provider: WalletProvider | null
  status: PasskitOperationStatus
  request_payload: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
  error_message: string | null
  created_by: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  actor_role: UserRole | null
  merchant_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface PublicPageView {
  id: string
  merchant_id: string
  slug: string
  name: string
  logo_url: string | null
  card_background_color: string | null
  card_text_color: string | null
  accent_color: string | null
  welcome_message: string | null
  apple_wallet_enabled: boolean
  google_wallet_enabled: boolean
  public_page_enabled: boolean
}

// ─── Insert Types ────────────────────────────────────────────────────────────

export interface ProfileInsert {
  id: string
  email: string
  full_name?: string | null
  role: UserRole
  merchant_id?: string | null
  status?: string | null
  created_at?: string
  updated_at?: string
}

export interface MerchantInsert {
  id?: string
  name: string
  owner_name?: string | null
  email?: string | null
  phone?: string | null
  business_type?: string | null
  logo_url?: string | null
  card_background_color?: string | null
  card_text_color?: string | null
  accent_color?: string | null
  welcome_message?: string | null
  slug: string
  points_mode?: PointsMode
  points_per_euro?: number | null
  fixed_points_per_visit?: number | null
  subscription_status?: SubscriptionStatus | null
  status?: MerchantStatus
  created_at?: string
  updated_at?: string
}

export interface MerchantSettingsInsert {
  id?: string
  merchant_id: string
  public_page_enabled?: boolean
  phone_required?: boolean
  email_required?: boolean
  custom_welcome_message?: string | null
  apple_wallet_enabled?: boolean
  google_wallet_enabled?: boolean
  created_at?: string
  updated_at?: string
}

export interface CardDesignInsert {
  id?: string
  merchant_id: string
  logo_url?: string | null
  background_color?: string | null
  text_color?: string | null
  accent_color?: string | null
  merchant_name_on_card?: string | null
  card_title?: string | null
  card_description?: string | null
  points_label?: string | null
  qr_label?: string | null
  apple_template_id?: string | null
  google_template_id?: string | null
  passkit_program_id?: string | null
  passkit_template_id?: string | null
  last_pushed_to_passkit_at?: string | null
  sync_status?: PasskitSyncStatus | null
  created_at?: string
  updated_at?: string
}

export interface CustomerInsert {
  id?: string
  merchant_id: string
  first_name: string
  phone?: string | null
  email?: string | null
  qr_code_token?: string
  points_balance?: number
  visits_count?: number
  last_visit_at?: string | null
  apple_pass_serial?: string | null
  google_wallet_id?: string | null
  wallet_status?: WalletStatus
  created_at?: string
  updated_at?: string
}

export interface WalletCardInsert {
  id?: string
  merchant_id: string
  customer_id: string
  provider: WalletProvider
  passkit_pass_id?: string | null
  passkit_serial?: string | null
  wallet_url?: string | null
  status?: WalletCardStatus
  last_synced_at?: string | null
  last_error?: string | null
  created_at?: string
  updated_at?: string
}

export interface PointsTransactionInsert {
  id?: string
  merchant_id: string
  customer_id: string
  type: TransactionType
  amount_paid?: number | null
  points_added?: number | null
  points_removed?: number | null
  balance_after: number
  description?: string | null
  created_by?: string | null
  created_at?: string
}

export interface OfferInsert {
  id?: string
  merchant_id: string
  label: string
  description?: string | null
  points_required: number
  status?: OfferStatus
  times_redeemed?: number
  created_at?: string
  updated_at?: string
}

export interface OfferRedemptionInsert {
  id?: string
  merchant_id: string
  offer_id: string
  customer_id: string
  points_spent: number
  redeemed_by?: string | null
  created_at?: string
}

export interface NotificationInsert {
  id?: string
  merchant_id: string
  title: string
  message: string
  target_type: NotificationTargetType
  target_filter?: Record<string, unknown> | null
  recipients_count?: number | null
  status?: NotificationStatus
  sent_by?: string | null
  sent_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface NotificationRecipientInsert {
  id?: string
  notification_id: string
  customer_id: string
  wallet_card_id?: string | null
  status?: string | null
  error_message?: string | null
  sent_at?: string | null
}

export interface SubscriptionInsert {
  id?: string
  merchant_id: string
  plan_name: string
  monthly_price?: number | null
  status?: SubscriptionStatus
  starts_at?: string | null
  renews_at?: string | null
  ends_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface PasskitConfigInsert {
  id?: string
  environment: PasskitEnvironment
  status?: PasskitConfigStatus
  default_apple_template_id?: string | null
  default_google_template_id?: string | null
  webhook_url?: string | null
  last_tested_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface PasskitOperationInsert {
  id?: string
  merchant_id?: string | null
  customer_id?: string | null
  wallet_card_id?: string | null
  operation_type: PasskitOperationType
  provider?: WalletProvider | null
  status?: PasskitOperationStatus
  request_payload?: Record<string, unknown> | null
  response_payload?: Record<string, unknown> | null
  error_message?: string | null
  created_by?: string | null
  created_at?: string
}

export interface AuditLogInsert {
  id?: string
  actor_id?: string | null
  actor_role?: UserRole | null
  merchant_id?: string | null
  action: string
  target_type?: string | null
  target_id?: string | null
  metadata?: Record<string, unknown> | null
  ip_address?: string | null
  created_at?: string
}

// ─── Supabase Database Interface ─────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
      }
      merchants: {
        Row: Merchant
        Insert: MerchantInsert
        Update: Partial<MerchantInsert>
      }
      merchant_settings: {
        Row: MerchantSettings
        Insert: MerchantSettingsInsert
        Update: Partial<MerchantSettingsInsert>
      }
      card_designs: {
        Row: CardDesign
        Insert: CardDesignInsert
        Update: Partial<CardDesignInsert>
      }
      customers: {
        Row: Customer
        Insert: CustomerInsert
        Update: Partial<CustomerInsert>
      }
      wallet_cards: {
        Row: WalletCard
        Insert: WalletCardInsert
        Update: Partial<WalletCardInsert>
      }
      points_transactions: {
        Row: PointsTransaction
        Insert: PointsTransactionInsert
        Update: Partial<PointsTransactionInsert>
      }
      offers: {
        Row: Offer
        Insert: OfferInsert
        Update: Partial<OfferInsert>
      }
      offer_redemptions: {
        Row: OfferRedemption
        Insert: OfferRedemptionInsert
        Update: Partial<OfferRedemptionInsert>
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: Partial<NotificationInsert>
      }
      notification_recipients: {
        Row: NotificationRecipient
        Insert: NotificationRecipientInsert
        Update: Partial<NotificationRecipientInsert>
      }
      subscriptions: {
        Row: Subscription
        Insert: SubscriptionInsert
        Update: Partial<SubscriptionInsert>
      }
      passkit_configs: {
        Row: PasskitConfig
        Insert: PasskitConfigInsert
        Update: Partial<PasskitConfigInsert>
      }
      passkit_operations: {
        Row: PasskitOperation
        Insert: PasskitOperationInsert
        Update: Partial<PasskitOperationInsert>
      }
      audit_logs: {
        Row: AuditLog
        Insert: AuditLogInsert
        Update: Partial<AuditLogInsert>
      }
    }
    Views: {
      admin_stats_view: {
        Row: {
          active_merchants: number
          total_merchants: number
          total_customers: number
          total_wallet_cards: number
          total_points_distributed: number
          monthly_revenue: number
        }
      }
      merchant_stats_view: {
        Row: {
          merchant_id: string
          total_customers: number
          total_points_distributed: number
          total_visits: number
          active_offers: number
          notifications_sent: number
        }
      }
    }
    Functions: {
      get_current_profile: {
        Args: Record<string, never>
        Returns: Profile
      }
      get_my_merchant_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_public_merchant_by_slug: {
        Args: { slug: string }
        Returns: PublicPageView
      }
      add_customer_points: {
        Args: {
          p_customer_id: string
          p_merchant_id: string
          p_points: number
          p_type: TransactionType
          p_description?: string
        }
        Returns: PointsTransaction
      }
      redeem_customer_offer: {
        Args: {
          p_customer_id: string
          p_offer_id: string
          p_merchant_id: string
        }
        Returns: { success: boolean; points_spent: number }
      }
    }
    Enums: {
      user_role: UserRole
      points_mode: PointsMode
      merchant_status: MerchantStatus
      subscription_status: SubscriptionStatus
      wallet_provider: WalletProvider
      wallet_status: WalletStatus
      wallet_card_status: WalletCardStatus
      transaction_type: TransactionType
      offer_status: OfferStatus
      notification_status: NotificationStatus
    }
  }
}
