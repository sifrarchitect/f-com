'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { createAgencySchema } from '@/lib/validations'
import { sendAgencyInvite } from '@/lib/email/send'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { ActionResult } from '@/types/database'

// =============================================
// Create Agency (Super Admin — creates auth user + sends invite)
// =============================================
export async function createAgency(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireRole('super_admin')

  // Guard: service role key is required for admin user creation
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { data: null, error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to Vercel environment variables.' }
  }

  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    owner_email: formData.get('owner_email') as string,
    owner_name: (formData.get('owner_name') as string) || undefined,
    plan_limit: parseInt(formData.get('plan_limit') as string, 10) || 100,
    notes: (formData.get('notes') as string) || undefined,
  }

  const parsed = createAgencySchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  // Admin client to set app_metadata
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const supabase = await createClient()

  // 1. Insert agency row first to get ID
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      owner_email: parsed.data.owner_email,
      owner_name: parsed.data.owner_name || null,
      plan_limit: parsed.data.plan_limit,
      notes: parsed.data.notes || null,
      primary_color: '#FFFFFF',
    } as never)
    .select('id')
    .single()

  if (agencyError) {
    if (agencyError.code === '23505') {
      return { data: null, error: 'An agency with this slug already exists.' }
    }
    return { data: null, error: agencyError.message }
  }

  const agencyId = (agency as { id: string }).id

  // 2. Create/invite auth user with agency_owner role
  const password = (formData.get('password') as string) || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: parsed.data.owner_email,
    password,
    email_confirm: true,
    app_metadata: { role: 'agency_owner', agency_id: agencyId },
  })

  if (authError) {
    // If user already exists, just update their metadata to link the agency
    if (authError.message.includes('already') || authError.message.includes('exists')) {
      const { data: existingUsers } = await adminClient.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(u => u.email === parsed.data.owner_email)
      if (existing) {
        await adminClient.auth.admin.updateUserById(existing.id, {
          app_metadata: { role: 'agency_owner', agency_id: agencyId },
        })
        await supabase
          .from('agencies')
          .update({ owner_id: existing.id } as never)
          .eq('id', agencyId)
      }
    } else {
      // Clean up agency row if user creation failed
      await supabase.from('agencies').delete().eq('id', agencyId)
      return { data: null, error: authError.message }
    }
  } else if (authUser?.user) {
    // Link owner_id on agency
    await supabase
      .from('agencies')
      .update({ owner_id: authUser.user.id } as never)
      .eq('id', agencyId)
  }

  // 3. Send invite email (fire-and-forget)
  try {
    await sendAgencyInvite({
      to: parsed.data.owner_email,
      agencyName: parsed.data.name,
      tempPassword: password,
      ownerName: parsed.data.owner_name,
      slug: parsed.data.slug,
    })
  } catch { /* email failure shouldn't block creation */ }

  revalidatePath('/admin/agencies')
  return { data: { id: agencyId }, error: null }
}

// =============================================
// Update Agency
// =============================================
export async function updateAgency(id: string, formData: FormData): Promise<ActionResult<null>> {
  await requireRole('super_admin')
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  const fields = ['name', 'slug', 'primary_color', 'custom_domain', 'notes', 'owner_name']
  for (const f of fields) {
    const val = formData.get(f)
    if (val !== null) updates[f] = val === '' ? null : val
  }
  const planLimit = formData.get('plan_limit')
  if (planLimit !== null) updates.plan_limit = parseInt(planLimit as string, 10)
  const isActive = formData.get('is_active')
  if (isActive !== null) updates.is_active = isActive === 'true'

  const { error } = await supabase
    .from('agencies')
    .update(updates as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/agencies')
  revalidatePath(`/admin/agencies/${id}`)
  return { data: null, error: null }
}

// =============================================
// Toggle Agency (kill switch)
// =============================================
export async function toggleAgency(id: string, isActive: boolean): Promise<ActionResult<null>> {
  await requireRole('super_admin')
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

// =============================================
// Delete Agency
// =============================================
export async function deleteAgency(id: string): Promise<ActionResult<null>> {
  await requireRole('super_admin')
  const supabase = await createClient()

  const { error } = await supabase
    .from('agencies')
    .delete()
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/agencies')
  return { data: null, error: null }
}
