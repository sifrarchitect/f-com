'use server'

import type { ActionResult } from '@/types/database'

export async function completeOnboardingStep(step: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function dismissOnboarding(): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
