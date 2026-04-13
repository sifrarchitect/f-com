'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function completeOnboardingStep(
  userId: string,
  role: 'agency' | 'shop',
  step: string,
  currentSteps: string[]
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const newSteps = [...currentSteps, step]

  const { error } = await supabase
    .from('onboarding_progress')
    .upsert(
      {
        user_id: userId,
        role,
        completed_steps: newSteps,
        is_complete: role === 'agency' ? newSteps.length >= 3 : newSteps.length >= 4,
      } as never,
      { onConflict: 'user_id' }
    )

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}

export async function dismissOnboarding(
  userId: string,
  role: 'agency' | 'shop'
): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('onboarding_progress')
    .upsert(
      {
        user_id: userId,
        role,
        dismissed: true,
      } as never,
      { onConflict: 'user_id' }
    )

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}
