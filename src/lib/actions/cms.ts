'use server'

// =============================================
// CMS Server Actions — Super Admin
// =============================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function updateCmsContent(id: string, value: string): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cms_content')
    .update({
      value,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/admin/cms')
  revalidatePath('/')
  return { data: null, error: null }
}

export async function getCmsValue(key: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cms_content')
    .select('value')
    .eq('key', key)
    .single()

  return (data as { value: string } | null)?.value || null
}
