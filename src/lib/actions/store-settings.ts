'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole, getUser } from '@/lib/auth'
import { updateShopSchema, createPlanSchema, updatePlanSchema } from '@/lib/validations'
import type { ActionResult } from '@/types/database'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// =============================================
// Store Settings (Shop Owner)
// =============================================
export async function updateStoreSettings(formData: FormData): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  const raw: Record<string, unknown> = {}
  const fields = [
    'name', 'description', 'banner_url', 'banner_text_title', 'banner_text_subtitle',
    'primary_color', 'contact_phone', 'contact_whatsapp',
    'bkash_merchant_number', 'nagad_merchant_number', 'rocket_merchant_number',
    'steadfast_api_key', 'steadfast_secret_key',
    'custom_privacy_policy', 'custom_terms',
    'seo_title', 'seo_description',
  ]
  for (const f of fields) {
    const val = formData.get(f)
    if (val !== null) raw[f] = val === '' ? null : val
  }

  const bannerVisible = formData.get('banner_visible')
  if (bannerVisible !== null) raw.banner_visible = bannerVisible === 'true'

  const deliveryInside = formData.get('delivery_fee_inside_dhaka')
  if (deliveryInside !== null) raw.delivery_fee_inside_dhaka = parseInt(deliveryInside as string, 10)

  const deliveryOutside = formData.get('delivery_fee_outside_dhaka')
  if (deliveryOutside !== null) raw.delivery_fee_outside_dhaka = parseInt(deliveryOutside as string, 10)

  const ruxspeedEnabled = formData.get('ruxspeed_enabled')
  if (ruxspeedEnabled !== null) raw.ruxspeed_enabled = ruxspeedEnabled === 'true'

  const parsed = updateShopSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const { error } = await supabase
    .from('shops')
    .update(parsed.data as never)
    .eq('id', user.shopId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/store')
  revalidatePath(`/store/${user.shopId}`)
  return { data: null, error: null }
}

// =============================================
// Discount Timers (Shop Owner)
// =============================================
export async function createDiscountTimer(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  const productId = formData.get('product_id') as string | null
  const discountPercent = parseInt(formData.get('discount_percent') as string, 10)
  const endsAt = formData.get('ends_at') as string
  const label = formData.get('label') as string

  if (!label || !discountPercent || !endsAt) {
    return { data: null, error: 'Label, discount %, and end date are required' }
  }

  const { data, error } = await supabase
    .from('discount_timers')
    .insert({
      shop_id: user.shopId!,
      product_id: productId || null,
      label,
      discount_percent: discountPercent,
      ends_at: endsAt,
      is_active: true,
    } as never)
    .select('id')
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/store')
  return { data: data as { id: string }, error: null }
}

export async function deleteDiscountTimer(id: string): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('discount_timers')
    .delete()
    .eq('id', id)
    .eq('shop_id', user.shopId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/store')
  return { data: null, error: null }
}

export async function toggleDiscountTimer(id: string, isActive: boolean): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('discount_timers')
    .update({ is_active: isActive } as never)
    .eq('id', id)
    .eq('shop_id', user.shopId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/store')
  return { data: null, error: null }
}

// =============================================
// Branding (Agency Owner)
// =============================================
export async function updateBranding(formData: FormData): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  const logoUrl = formData.get('logo_url')
  const primaryColor = formData.get('primary_color')
  const customDomain = formData.get('custom_domain')
  const showPoweredBy = formData.get('show_powered_by')
  const ownerName = formData.get('owner_name')

  if (logoUrl !== null) updates.logo_url = logoUrl || null
  if (primaryColor) updates.primary_color = primaryColor
  if (customDomain !== null) updates.custom_domain = customDomain || null
  if (showPoweredBy !== null) updates.show_powered_by = showPoweredBy === 'true'
  if (ownerName !== null) updates.owner_name = ownerName || null

  const { error } = await supabase
    .from('agencies')
    .update(updates as never)
    .eq('id', user.agencyId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/settings/branding')
  return { data: null, error: null }
}

// =============================================
// Plans (Agency Owner)
// =============================================
export async function createPlan(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole('agency_owner')

  const raw = {
    name: formData.get('name') as string,
    price: parseInt(formData.get('price') as string, 10) || 0,
    features: JSON.parse((formData.get('features') as string) || '[]') as string[],
    is_active: formData.get('is_active') !== 'false',
  }

  const parsed = createPlanSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agency_plans')
    .insert({
      agency_id: user.agencyId!,
      name: parsed.data.name,
      price: parsed.data.price,
      features: parsed.data.features,
      is_active: parsed.data.is_active,
    } as never)
    .select('id')
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/settings/plans')
  return { data: data as { id: string }, error: null }
}

export async function updatePlan(id: string, formData: FormData): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')

  const raw = {
    name: formData.get('name') as string || undefined,
    price: formData.get('price') ? parseInt(formData.get('price') as string, 10) : undefined,
    features: formData.get('features') ? JSON.parse(formData.get('features') as string) : undefined,
    is_active: formData.get('is_active') !== null ? formData.get('is_active') === 'true' : undefined,
  }

  const parsed = updatePlanSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('agency_plans')
    .update(parsed.data as never)
    .eq('id', id)
    .eq('agency_id', user.agencyId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/settings/plans')
  return { data: null, error: null }
}

export async function deletePlan(id: string): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('agency_plans')
    .delete()
    .eq('id', id)
    .eq('agency_id', user.agencyId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/settings/plans')
  return { data: null, error: null }
}

export async function togglePlan(id: string, isActive: boolean): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('agency_plans')
    .update({ is_active: isActive } as never)
    .eq('id', id)
    .eq('agency_id', user.agencyId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/settings/plans')
  return { data: null, error: null }
}

// =============================================
// Doomsday (Super Admin only)
// =============================================
export async function suspendAllAgencies(): Promise<ActionResult<null>> {
  await requireRole('super_admin')
  const supabase = await createClient()

  const { error } = await supabase
    .from('agencies')
    .update({ is_active: false } as never)
    .neq('id', '00000000-0000-0000-0000-000000000000') // update all

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/agencies')
  return { data: null, error: null }
}
