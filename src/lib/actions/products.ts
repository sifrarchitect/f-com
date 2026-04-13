'use server'

import type { ActionResult } from '@/types/database'

export async function createProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function reorderProducts(productIds: string[]): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
