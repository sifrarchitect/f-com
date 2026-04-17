'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AgencyOnboarding from '@/components/agency/AgencyOnboarding'
import { completeOnboardingStep, dismissOnboarding } from '@/lib/actions/onboarding'

interface Props {
  userId: string
  completedSteps: string[]
  dismissed: boolean
}

export default function AgencyOnboardingClient({ userId, completedSteps, dismissed }: Props) {
  const router = useRouter()
  const [localDismissed, setLocalDismissed] = useState(dismissed)

  const handleDismiss = async () => {
    setLocalDismissed(true)
    await dismissOnboarding(userId, 'agency')
    router.refresh()
  }

  const handleComplete = async (step: string) => {
    await completeOnboardingStep(userId, 'agency', step, completedSteps)
    router.refresh()
  }

  if (localDismissed) return null

  return (
    <AgencyOnboarding
      completedSteps={completedSteps}
      dismissed={localDismissed}
      onDismiss={handleDismiss}
      onComplete={handleComplete}
    />
  )
}
