'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import type { ActionResult } from '@/types/database'

export async function markNotificationsRead(notificationIds: string[]): Promise<ActionResult<null>> {
  const user = await requireAuth()
  if (!notificationIds.length) return { data: null, error: null }

  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true } as never)
    .in('id', notificationIds)
    .eq('user_id', user.id) // RLS guard: only own notifications

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}

export async function markAllNotificationsRead(): Promise<ActionResult<null>> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true } as never)
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}
