'use server'

// =============================================
// Shop Server Actions — Agency Panel
// =============================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function createShop(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const agencyId = formData.get('agency_id') as string
  const ownerEmail = formData.get('owner_email') as string

  if (!name || !slug || !agencyId) {
    return { data: null, error: 'Name, slug, and agency are required' }
  }

  const { data, error } = await supabase
    .from('shops')
    .insert({
      name,
      slug,
      agency_id: agencyId,
      owner_email: ownerEmail || null,
    } as never)
    .select('id')
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/shops')
  return { data: data as { id: string }, error: null }
}

export async function updateShop(id: string, formData: FormData): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  const name = formData.get('name')
  const slug = formData.get('slug')
  const description = formData.get('description')
  const primaryColor = formData.get('primary_color')

  if (name) updates.name = name
  if (slug) updates.slug = slug
  if (description !== null) updates.description = description || null
  if (primaryColor) updates.primary_color = primaryColor

  const { error } = await supabase
    .from('shops')
    .update(updates as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/shops')
  revalidatePath(`/agency/shops/${id}`)
  return { data: null, error: null }
}

export async function toggleShop(id: string, isActive: boolean): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shops')
    .update({ is_active: isActive } as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/shops')
  revalidatePath(`/agency/shops/${id}`)
  return { data: null, error: null }
}
