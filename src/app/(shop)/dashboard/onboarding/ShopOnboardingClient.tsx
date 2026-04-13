'use client'

import ShopOnboarding from '@/components/shop/ShopOnboarding'
import { dismissOnboarding } from '@/lib/actions/onboarding'

interface Props {
  userId: string
  completedSteps: string[]
  dismissed: boolean
}

export default function ShopOnboardingClient({ userId, completedSteps, dismissed }: Props) {
  const handleDismiss = async () => {
    await dismissOnboarding(userId, 'shop')
  }

  return (
    <ShopOnboarding
      completedSteps={completedSteps}
      dismissed={dismissed}
      onDismiss={handleDismiss}
    />
  )
}
