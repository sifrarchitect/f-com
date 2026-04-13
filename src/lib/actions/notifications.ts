'use server'

import type { ActionResult } from '@/types/database'

export async function markNotificationsRead(notificationIds: string[]): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function markAllNotificationsRead(): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
