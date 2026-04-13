'use server'

// =============================================
// Agency Server Actions
// Full implementation: Session 5 (admin) + Session 6 (agency)
// =============================================

import type { ActionResult } from '@/types/database'

export async function createAgency(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function updateAgency(id: string, formData: FormData): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function toggleAgency(id: string, isActive: boolean): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function deleteAgency(id: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
