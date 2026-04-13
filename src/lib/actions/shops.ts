'use server'

import type { ActionResult } from '@/types/database'

export async function createShop(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function updateShop(id: string, formData: FormData): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function toggleShop(id: string, isActive: boolean): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
