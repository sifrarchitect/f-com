'use server'

import type { ActionResult } from '@/types/database'

export async function addToBlacklist(formData: FormData): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function removeFromBlacklist(id: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
