'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ShopOnboarding from '@/components/shop/ShopOnboarding'
import { dismissOnboarding } from '@/lib/actions/onboarding'

interface Props {
  userId: string
  completedSteps: string[]
  dismissed: boolean
}

export default function ShopOnboardingClient({ userId, completedSteps, dismissed }: Props) {
  const router = useRouter()
  const [localDismissed, setLocalDismissed] = useState(dismissed)

  const handleDismiss = async () => {
    setLocalDismissed(true)
    await dismissOnboarding(userId, 'shop')
    router.refresh()
  }

  if (localDismissed) return null

  return (
    <ShopOnboarding
      completedSteps={completedSteps}
      dismissed={localDismissed}
      onDismiss={handleDismiss}
    />
  )
}
