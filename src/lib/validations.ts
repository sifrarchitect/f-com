// =============================================
// F-Manager — Zod Validation Schemas
// Used for both client (UX feedback) AND server (actual enforcement)
// =============================================

import { z } from 'zod'
import { isValidBDPhone } from './phone'

// =====================
// SLUG VALIDATION
// =====================
export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')

// =====================
// PHONE VALIDATION
// =====================
export const bdPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(isValidBDPhone, 'Enter a valid Bangladeshi phone number (01XXXXXXXXX)')

// =====================
// AGENCY SCHEMAS
// =====================
export const createAgencySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: slugSchema,
  owner_email: z.string().email('Invalid email address'),
  owner_name: z.string().min(2).max(100).optional(),
  plan_limit: z.number().int().min(1).max(10000).default(100),
  notes: z.string().max(500).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72).optional(),
})

export const updateAgencySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logo_url: z.string().url().optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  custom_domain: z.string().max(255).optional().nullable(),
  show_powered_by: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// =====================
// AGENCY PLAN SCHEMAS
// =====================
export const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name is required').max(50),
  price: z.number().int().min(0, 'Price must be positive'),
  features: z.array(z.string().max(100)).max(20).default([]),
  is_active: z.boolean().default(true),
})

export const updatePlanSchema = createPlanSchema.partial()

// =====================
// SHOP SCHEMAS
// =====================
export const createShopSchema = z.object({
  name: z.string().min(2, 'Shop name is required').max(100),
  slug: slugSchema,
  owner_email: z.string().email('Invalid email address'),
  plan_id: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
})

export const updateShopSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  banner_url: z.string().url().optional().nullable(),
  banner_text_title: z.string().max(100).optional().nullable(),
  banner_text_subtitle: z.string().max(200).optional().nullable(),
  banner_visible: z.boolean().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bkash_merchant_number: z.string().max(20).optional().nullable(),
  nagad_merchant_number: z.string().max(20).optional().nullable(),
  rocket_merchant_number: z.string().max(20).optional().nullable(),
  steadfast_api_key: z.string().max(200).optional().nullable(),
  steadfast_secret_key: z.string().max(200).optional().nullable(),
  delivery_fee_inside_dhaka: z.number().int().min(0).max(5000).optional(),
  delivery_fee_outside_dhaka: z.number().int().min(0).max(5000).optional(),
  contact_phone: z.string().max(20).optional().nullable(),
  contact_whatsapp: z.string().max(20).optional().nullable(),
  custom_privacy_policy: z.string().max(10000).optional().nullable(),
  custom_terms: z.string().max(10000).optional().nullable(),
  seo_title: z.string().max(100).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  ruxspeed_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// =====================
// PRODUCT SCHEMAS
// =====================
const variantOptionSchema = z.object({
  value: z.string().min(1, 'Option value required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  price_modifier: z.number().int().default(0),
})

const variantTypeSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1, 'Variant type required').max(50),
  options: z.array(variantOptionSchema).min(1, 'At least one option required'),
})

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  slug: slugSchema,
  description: z.string().max(10000).optional(),
  images: z.array(z.string().url()).max(5).default([]),
  base_price: z.number().int().min(1, 'Price must be at least 1 BDT'),
  simple_stock: z.number().int().min(0).default(0),
  variants: z.array(variantTypeSchema).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  seo_title: z.string().max(100).optional(),
  seo_description: z.string().max(300).optional(),
})

export const updateProductSchema = createProductSchema.partial()

// =====================
// ORDER / CHECKOUT SCHEMAS
// =====================
export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Full name is required').max(100),
  customer_phone: bdPhoneSchema,
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  customer_address: z.string().min(5, 'Address is required').max(500),
  delivery_zone: z.enum(['inside_dhaka', 'outside_dhaka'], {
    message: 'Select a delivery zone',
  }),
  quantity: z.number().int().min(1).max(10),
  payment_method: z.enum(['bkash', 'nagad', 'rocket'], {
    message: 'Select a payment method',
  }),
  payment_trx_id: z.string().min(8, 'Transaction ID must be at least 8 characters').max(30),
  // Product + variant info
  product_id: z.string().uuid(),
  variant_type: z.string().optional().nullable(),
  variant_value: z.string().optional().nullable(),
})

// =====================
// DISCOUNT TIMER SCHEMAS
// =====================
export const createTimerSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  product_id: z.string().uuid().optional().nullable(),
  discount_percent: z.number().int().min(1).max(100),
  ends_at: z.string().datetime({ message: 'Invalid date format' }),
  is_active: z.boolean().default(true),
})

// =====================
// BLACKLIST SCHEMAS
// =====================
export const addToBlacklistSchema = z.object({
  phone: bdPhoneSchema,
  reason: z.enum(['fraud', 'fake_order', 'abusive', 'chargeback', 'other']),
  notes: z.string().max(500).optional(),
})

// =====================
// CMS SCHEMAS
// =====================
export const updateCmsSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1).max(50000),
})

// =====================
// AUTH SCHEMAS
// =====================
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// =====================
// TYPE EXPORTS
// =====================
export type CreateAgencyInput = z.infer<typeof createAgencySchema>
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>
export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type CreateShopInput = z.infer<typeof createShopSchema>
export type UpdateShopInput = z.infer<typeof updateShopSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CreateTimerInput = z.infer<typeof createTimerSchema>
export type AddToBlacklistInput = z.infer<typeof addToBlacklistSchema>
export type LoginInput = z.infer<typeof loginSchema>
