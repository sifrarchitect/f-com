'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import type { ActionResult } from '@/types/database'

export async function markInvoicePaid(invoiceId: string): Promise<ActionResult<null>> {
  await requireRole('super_admin')
  const supabase = await createClient()

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    } as never)
    .eq('id', invoiceId)
    .eq('status', 'unpaid') // idempotent

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/billing')
  return { data: null, error: null }
}

export async function generateInvoicesNow(): Promise<ActionResult<null>> {
  await requireRole('super_admin')
  const supabase = await createClient()

  const { error } = await supabase.rpc('generate_monthly_invoices')
  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/billing')
  return { data: null, error: null }
}
