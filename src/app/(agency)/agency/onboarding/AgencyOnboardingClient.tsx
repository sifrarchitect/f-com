'use client'

import AgencyOnboarding from '@/components/agency/AgencyOnboarding'
import { completeOnboardingStep, dismissOnboarding } from '@/lib/actions/onboarding'

interface Props {
  userId: string
  completedSteps: string[]
  dismissed: boolean
}

export default function AgencyOnboardingClient({ userId, completedSteps, dismissed }: Props) {
  const handleDismiss = async () => {
    await dismissOnboarding(userId, 'agency')
  }

  const handleComplete = async (step: string) => {
    await completeOnboardingStep(userId, 'agency', step, completedSteps)
  }

  return (
    <AgencyOnboarding
      completedSteps={completedSteps}
      dismissed={dismissed}
      onDismiss={handleDismiss}
      onComplete={handleComplete}
    />
  )
}
