'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole, getUser } from '@/lib/auth'
import { addToBlacklistSchema } from '@/lib/validations'
import { normalizePhone } from '@/lib/phone'
import type { ActionResult } from '@/types/database'

export async function addToBlacklist(formData: FormData): Promise<ActionResult<null>> {
  const user = await getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const raw = {
    phone: formData.get('phone') as string,
    reason: formData.get('reason') as string,
    notes: (formData.get('notes') as string) || undefined,
  }

  const parsed = addToBlacklistSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const normalizedPhone = normalizePhone(parsed.data.phone)
  const supabase = await createClient()

  // Check for existing active entry
  const { data: existing } = await supabase
    .from('customer_blacklist')
    .select('id, is_active')
    .eq('phone', normalizedPhone)
    .single()

  if (existing && (existing as { is_active: boolean }).is_active) {
    return { data: null, error: 'This number is already blacklisted' }
  }

  if (existing) {
    // Reactivate instead of duplicate insert
    const { error } = await supabase
      .from('customer_blacklist')
      .update({
        is_active: true,
        reason: parsed.data.reason,
        notes: parsed.data.notes || null,
        added_by_agency_id: user.agencyId || null,
        added_by_shop_id: user.shopId || null,
      } as never)
      .eq('id', (existing as { id: string }).id)
    if (error) return { data: null, error: error.message }
  } else {
    const { error } = await supabase
      .from('customer_blacklist')
      .insert({
        phone: normalizedPhone,
        reason: parsed.data.reason,
        notes: parsed.data.notes || null,
        added_by_agency_id: user.agencyId || null,
        added_by_shop_id: user.shopId || null,
        is_active: true,
      } as never)
    if (error) return { data: null, error: error.message }
  }

  revalidatePath('/admin/blacklist')
  revalidatePath('/dashboard/orders')
  return { data: null, error: null }
}

export async function removeFromBlacklist(id: string): Promise<ActionResult<null>> {
  const user = await getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('customer_blacklist')
    .update({ is_active: false } as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/blacklist')
  return { data: null, error: null }
}
