'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { createShopSchema } from '@/lib/validations'
import { sendShopInvite } from '@/lib/email/send'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { ActionResult } from '@/types/database'

function generateSecretKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// =============================================
// Create Shop (Agency Owner — creates auth user + sends invite)
// =============================================
export async function createShop(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole('agency_owner')

  // Guard: service role key is required for admin user creation
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { data: null, error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to Vercel environment variables.' }
  }

  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    owner_email: formData.get('owner_email') as string,
    plan_id: (formData.get('plan_id') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
  }

  const parsed = createShopSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const supabase = await createClient()

  // 1. Get agency info (for invite email)
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, slug, logo_url')
    .eq('id', user.agencyId!)
    .single()

  if (!agency) return { data: null, error: 'Agency not found' }
  const ag = agency as { id: string; name: string; slug: string; logo_url: string | null }

  // 2. Insert shop row
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .insert({
      agency_id: user.agencyId!,
      name: parsed.data.name,
      slug: parsed.data.slug,
      owner_email: parsed.data.owner_email,
      plan_id: parsed.data.plan_id || null,
      description: parsed.data.description || null,
      payment_secret_key: generateSecretKey(),
    } as never)
    .select('id')
    .single()

  if (shopError) {
    if (shopError.code === '23505') {
      return { data: null, error: 'A shop with this URL slug already exists.' }
    }
    return { data: null, error: shopError.message }
  }

  const shopId = (shop as { id: string }).id

  // 3. Create/update auth user with shop_owner role
  const password = (formData.get('password') as string) || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: parsed.data.owner_email,
    password,
    email_confirm: true,
    app_metadata: { role: 'shop_owner', shop_id: shopId, agency_id: user.agencyId },
  })

  if (authError) {
    if (authError.message.includes('already') || authError.message.includes('exists')) {
      // User exists — update metadata
      const { data: existingUsers } = await adminClient.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(u => u.email === parsed.data.owner_email)
      if (existing) {
        await adminClient.auth.admin.updateUserById(existing.id, {
          app_metadata: { role: 'shop_owner', shop_id: shopId, agency_id: user.agencyId },
        })
        await supabase
          .from('shops')
          .update({ owner_id: existing.id } as never)
          .eq('id', shopId)
      }
    } else {
      await supabase.from('shops').delete().eq('id', shopId)
      return { data: null, error: authError.message }
    }
  } else if (authUser?.user) {
    await supabase
      .from('shops')
      .update({ owner_id: authUser.user.id } as never)
      .eq('id', shopId)
  }

  // 4. Send invite email
  try {
    await sendShopInvite({
      to: parsed.data.owner_email,
      agencyName: ag.name,
      agencyLogo: ag.logo_url || undefined,
      shopName: parsed.data.name,
      tempPassword: password,
      agencySlug: ag.slug,
    })
  } catch { /* ignore */ }

  revalidatePath('/agency/shops')
  return { data: { id: shopId }, error: null }
}

// =============================================
// Update Shop
// =============================================
export async function updateShop(id: string, formData: FormData): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  const fields = ['name', 'slug', 'description', 'primary_color']
  for (const f of fields) {
    const val = formData.get(f)
    if (val !== null) updates[f] = val === '' ? null : val
  }
  const isActive = formData.get('is_active')
  if (isActive !== null) updates.is_active = isActive === 'true'

  const { error } = await supabase
    .from('shops')
    .update(updates as never)
    .eq('id', id)
    .eq('agency_id', user.agencyId!) // ownership guard

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/shops')
  revalidatePath(`/agency/shops/${id}`)
  return { data: null, error: null }
}

// =============================================
// Toggle Shop (Kill Switch — Agency Owner)
// =============================================
export async function toggleShop(id: string, isActive: boolean): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('shops')
    .update({ is_active: isActive } as never)
    .eq('id', id)
    .eq('agency_id', user.agencyId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/shops')
  revalidatePath(`/agency/shops/${id}`)
  return { data: null, error: null }
}

// =============================================
// Delete Shop
// =============================================
export async function deleteShop(id: string): Promise<ActionResult<null>> {
  const user = await requireRole('agency_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', id)
    .eq('agency_id', user.agencyId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/agency/shops')
  return { data: null, error: null }
}
