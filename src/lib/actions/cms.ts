'use server'

import type { ActionResult } from '@/types/database'

export async function updateCmsContent(key: string, value: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function getCmsContent(keys: string[]): Promise<ActionResult<Record<string, string>>> {
  return { data: null, error: 'Not yet implemented' }
}
