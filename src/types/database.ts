// =============================================
// F-Manager — TypeScript Database Types
// Manual types matching the schema until Supabase CLI generates them.
// Run `npm run db:types` to replace this with auto-generated types.
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          custom_domain: string | null
          logo_url: string | null
          primary_color: string
          owner_email: string
          owner_name: string | null
          owner_id: string | null
          is_active: boolean
          plan_limit: number
          show_powered_by: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          custom_domain?: string | null
          logo_url?: string | null
          primary_color?: string
          owner_email: string
          owner_name?: string | null
          owner_id?: string | null
          is_active?: boolean
          plan_limit?: number
          show_powered_by?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          custom_domain?: string | null
          logo_url?: string | null
          primary_color?: string
          owner_email?: string
          owner_name?: string | null
          owner_id?: string | null
          is_active?: boolean
          plan_limit?: number
          show_powered_by?: boolean
          notes?: string | null
        }
      }
      agency_plans: {
        Row: {
          id: string
          created_at: string
          agency_id: string
          name: string
          price: number
          features: string[]
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          agency_id: string
          name: string
          price: number
          features?: string[]
          is_active?: boolean
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          price?: number
          features?: string[]
          is_active?: boolean
        }
      }
      shops: {
        Row: {
          id: string
          created_at: string
          agency_id: string
          owner_id: string | null
          owner_email: string | null
          name: string
          slug: string
          description: string | null
          banner_url: string | null
          banner_text_title: string | null
          banner_text_subtitle: string | null
          banner_visible: boolean
          primary_color: string
          plan_id: string | null
          is_active: boolean
          payment_secret_key: string
          ruxspeed_enabled: boolean
          bkash_merchant_number: string | null
          nagad_merchant_number: string | null
          rocket_merchant_number: string | null
          steadfast_api_key: string | null
          steadfast_secret_key: string | null
          delivery_fee_inside_dhaka: number
          delivery_fee_outside_dhaka: number
          contact_phone: string | null
          contact_whatsapp: string | null
          custom_privacy_policy: string | null
          custom_terms: string | null
          seo_title: string | null
          seo_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          agency_id: string
          owner_id?: string | null
          owner_email?: string | null
          name: string
          slug: string
          description?: string | null
          banner_url?: string | null
          banner_text_title?: string | null
          banner_text_subtitle?: string | null
          banner_visible?: boolean
          primary_color?: string
          plan_id?: string | null
          is_active?: boolean
          payment_secret_key?: string
          ruxspeed_enabled?: boolean
          bkash_merchant_number?: string | null
          nagad_merchant_number?: string | null
          rocket_merchant_number?: string | null
          steadfast_api_key?: string | null
          steadfast_secret_key?: string | null
          delivery_fee_inside_dhaka?: number
          delivery_fee_outside_dhaka?: number
          contact_phone?: string | null
          contact_whatsapp?: string | null
          custom_privacy_policy?: string | null
          custom_terms?: string | null
          seo_title?: string | null
          seo_description?: string | null
        }
        Update: {
          id?: string
          agency_id?: string
          owner_id?: string | null
          owner_email?: string | null
          name?: string
          slug?: string
          description?: string | null
          banner_url?: string | null
          banner_text_title?: string | null
          banner_text_subtitle?: string | null
          banner_visible?: boolean
          primary_color?: string
          plan_id?: string | null
          is_active?: boolean
          ruxspeed_enabled?: boolean
          bkash_merchant_number?: string | null
          nagad_merchant_number?: string | null
          rocket_merchant_number?: string | null
          steadfast_api_key?: string | null
          steadfast_secret_key?: string | null
          delivery_fee_inside_dhaka?: number
          delivery_fee_outside_dhaka?: number
          contact_phone?: string | null
          contact_whatsapp?: string | null
          custom_privacy_policy?: string | null
          custom_terms?: string | null
          seo_title?: string | null
          seo_description?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          shop_id: string
          name: string
          slug: string
          description: string | null
          images: string[]
          base_price: number
          simple_stock: number
          has_variants: boolean
          variants: Json
          is_active: boolean
          sort_order: number
          seo_title: string | null
          seo_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          shop_id: string
          name: string
          slug: string
          description?: string | null
          images?: string[]
          base_price: number
          simple_stock?: number
          variants?: Json
          is_active?: boolean
          sort_order?: number
          seo_title?: string | null
          seo_description?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          slug?: string
          description?: string | null
          images?: string[]
          base_price?: number
          simple_stock?: number
          variants?: Json
          is_active?: boolean
          sort_order?: number
          seo_title?: string | null
          seo_description?: string | null
        }
      }
      discount_timers: {
        Row: {
          id: string
          created_at: string
          shop_id: string
          product_id: string | null
          label: string
          discount_percent: number
          ends_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          shop_id: string
          product_id?: string | null
          label?: string
          discount_percent: number
          ends_at: string
          is_active?: boolean
        }
        Update: {
          id?: string
          shop_id?: string
          product_id?: string | null
          label?: string
          discount_percent?: number
          ends_at?: string
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          order_number: string
          shop_id: string
          product_id: string | null
          variant_snapshot: Json | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          customer_address: string
          delivery_zone: 'inside_dhaka' | 'outside_dhaka'
          quantity: number
          unit_price: number
          original_unit_price: number | null
          delivery_fee: number
          discount_amount: number
          total_price: number
          payment_method: 'bkash' | 'nagad' | 'rocket' | null
          payment_trx_id: string | null
          payment_amount_expected: number | null
          payment_status: 'pending' | 'verified' | 'failed'
          delivery_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          steadfast_consignment_id: string | null
          steadfast_tracking_code: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          stock_restored: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          order_number?: string
          shop_id: string
          product_id?: string | null
          variant_snapshot?: Json | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          customer_address: string
          delivery_zone: 'inside_dhaka' | 'outside_dhaka'
          quantity?: number
          unit_price: number
          original_unit_price?: number | null
          delivery_fee?: number
          discount_amount?: number
          total_price: number
          payment_method?: 'bkash' | 'nagad' | 'rocket' | null
          payment_trx_id?: string | null
          payment_amount_expected?: number | null
          payment_status?: 'pending' | 'verified' | 'failed'
          delivery_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          steadfast_consignment_id?: string | null
          steadfast_tracking_code?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          stock_restored?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          product_id?: string | null
          variant_snapshot?: Json | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          customer_address?: string
          delivery_zone?: 'inside_dhaka' | 'outside_dhaka'
          quantity?: number
          unit_price?: number
          original_unit_price?: number | null
          delivery_fee?: number
          discount_amount?: number
          total_price?: number
          payment_method?: 'bkash' | 'nagad' | 'rocket' | null
          payment_trx_id?: string | null
          payment_amount_expected?: number | null
          payment_status?: 'pending' | 'verified' | 'failed'
          delivery_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          steadfast_consignment_id?: string | null
          steadfast_tracking_code?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          stock_restored?: boolean
          notes?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          variant_snapshot: Json | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          variant_snapshot?: Json | null
          quantity?: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_image?: string | null
          variant_snapshot?: Json | null
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          agency_id: string
          month: number
          year: number
          active_shop_count: number
          amount_bdt: number
          status: 'unpaid' | 'paid'
          paid_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          agency_id: string
          month: number
          year: number
          active_shop_count?: number
          amount_bdt?: number
          status?: 'unpaid' | 'paid'
          paid_at?: string | null
        }
        Update: {
          id?: string
          agency_id?: string
          month?: number
          year?: number
          active_shop_count?: number
          amount_bdt?: number
          status?: 'unpaid' | 'paid'
          paid_at?: string | null
        }
      }
      cms_content: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: string
          title: string
          message: string | null
          is_read: boolean
          link: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          is_read?: boolean
          link?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          is_read?: boolean
          link?: string | null
        }
      }
      customer_blacklist: {
        Row: {
          id: string
          created_at: string
          phone: string
          reason: string
          notes: string | null
          added_by_agency_id: string | null
          added_by_shop_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          phone: string
          reason: string
          notes?: string | null
          added_by_agency_id?: string | null
          added_by_shop_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          phone?: string
          reason?: string
          notes?: string | null
          added_by_agency_id?: string | null
          added_by_shop_id?: string | null
          is_active?: boolean
        }
      }
      onboarding_progress: {
        Row: {
          id: string
          user_id: string
          role: 'agency' | 'shop'
          completed_steps: string[]
          is_complete: boolean
          dismissed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'agency' | 'shop'
          completed_steps?: string[]
          is_complete?: boolean
          dismissed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'agency' | 'shop'
          completed_steps?: string[]
          is_complete?: boolean
          dismissed?: boolean
          updated_at?: string
        }
      }
      payment_webhook_log: {
        Row: {
          id: string
          created_at: string
          shop_id: string | null
          sms_text: string | null
          sms_from: string | null
          extracted_trx_id: string | null
          extracted_amount: number | null
          matched_order_id: string | null
          result: 'verified' | 'amount_mismatch' | 'not_found' | 'duplicate' | 'invalid_signature'
          raw_payload: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          shop_id?: string | null
          sms_text?: string | null
          sms_from?: string | null
          extracted_trx_id?: string | null
          extracted_amount?: number | null
          matched_order_id?: string | null
          result: 'verified' | 'amount_mismatch' | 'not_found' | 'duplicate' | 'invalid_signature'
          raw_payload?: Json | null
        }
        Update: {
          id?: string
          shop_id?: string | null
          sms_text?: string | null
          sms_from?: string | null
          extracted_trx_id?: string | null
          extracted_amount?: number | null
          matched_order_id?: string | null
          result?: 'verified' | 'amount_mismatch' | 'not_found' | 'duplicate' | 'invalid_signature'
          raw_payload?: Json | null
        }
      }
    }
    Functions: {
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_agency_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_user_shop_id: {
        Args: Record<string, never>
        Returns: string
      }
      normalize_bd_phone: {
        Args: { p_phone: string }
        Returns: string
      }
      deduct_variant_stock: {
        Args: {
          p_product_id: string
          p_variant_type: string | null
          p_variant_value: string | null
          p_quantity: number
        }
        Returns: Json
      }
      restore_variant_stock: {
        Args: { p_order_id: string }
        Returns: Json
      }
      is_customer_blacklisted: {
        Args: { p_phone: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_link?: string
        }
        Returns: undefined
      }
      generate_monthly_invoices: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}

// =====================
// CONVENIENCE TYPE ALIASES
// =====================
export type Agency = Database['public']['Tables']['agencies']['Row']
export type AgencyInsert = Database['public']['Tables']['agencies']['Insert']
export type AgencyUpdate = Database['public']['Tables']['agencies']['Update']

export type AgencyPlan = Database['public']['Tables']['agency_plans']['Row']
export type AgencyPlanInsert = Database['public']['Tables']['agency_plans']['Insert']

export type Shop = Database['public']['Tables']['shops']['Row']
export type ShopInsert = Database['public']['Tables']['shops']['Insert']
export type ShopUpdate = Database['public']['Tables']['shops']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type DiscountTimer = Database['public']['Tables']['discount_timers']['Row']
export type DiscountTimerInsert = Database['public']['Tables']['discount_timers']['Insert']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']

export type CmsContent = Database['public']['Tables']['cms_content']['Row']

export type Notification = Database['public']['Tables']['notifications']['Row']

export type CustomerBlacklist = Database['public']['Tables']['customer_blacklist']['Row']

export type OnboardingProgress = Database['public']['Tables']['onboarding_progress']['Row']

export type PaymentWebhookLog = Database['public']['Tables']['payment_webhook_log']['Row']

// =====================
// VARIANT TYPES (for JSONB field)
// =====================
export interface VariantOption {
  value: string
  stock: number
  price_modifier: number
}

export interface VariantType {
  id: string
  type: string
  options: VariantOption[]
}

export interface VariantSnapshot {
  type: string
  value: string
  price_modifier: number
  original_price: number
  final_price: number
}

// =====================
// USER ROLE TYPES
// =====================
export type UserRole = 'super_admin' | 'agency_owner' | 'shop_owner'

export interface UserAppMetadata {
  role: UserRole
  agency_id?: string
  shop_id?: string
}

// =====================
// ACTION RESULT TYPE
// =====================
export type ActionResult<T> = {
  data: T | null
  error: string | null
}
