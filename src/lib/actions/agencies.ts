'use server'

// =============================================
// Agency Server Actions — Super Admin
// =============================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function createAgency(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const ownerEmail = formData.get('owner_email') as string
  const primaryColor = (formData.get('primary_color') as string) || '#FFFFFF'

  if (!name || !slug || !ownerEmail) {
    return { data: null, error: 'Name, slug, and owner email are required' }
  }

  const { data, error } = await supabase
    .from('agencies')
    .insert({
      name,
      slug,
      owner_email: ownerEmail,
      primary_color: primaryColor,
    } as never)
    .select('id')
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/agencies')
  return { data: data as { id: string }, error: null }
}

export async function updateAgency(id: string, formData: FormData): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  const name = formData.get('name')
  const slug = formData.get('slug')
  const primaryColor = formData.get('primary_color')
  const customDomain = formData.get('custom_domain')
  const notes = formData.get('notes')

  if (name) updates.name = name
  if (slug) updates.slug = slug
  if (primaryColor) updates.primary_color = primaryColor
  if (customDomain !== null) updates.custom_domain = customDomain || null
  if (notes !== null) updates.notes = notes || null

  const { error } = await supabase
    .from('agencies')
    .update(updates as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/agencies')
  revalidatePath(`/admin/agencies/${id}`)
  return { data: null, error: null }
}

export async function toggleAgency(id: string, isActive: boolean): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('agencies')
    .update({ is_active: isActive } as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/agencies')
  revalidatePath(`/admin/agencies/${id}`)
  return { data: null, error: null }
}

export async function deleteAgency(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('agencies')
    .delete()
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/agencies')
  return { data: null, error: null }
}
