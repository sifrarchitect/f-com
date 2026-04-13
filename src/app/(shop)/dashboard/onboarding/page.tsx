import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { OnboardingProgress } from '@/types/database'
import ShopOnboardingClient from './ShopOnboardingClient'

export default async function ShopOnboardingPage() {
  const user = await getUser()
  if (!user || user.role !== 'shop_owner') redirect('/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'shop')
    .single()

  const progress = data as OnboardingProgress | null

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-2">Welcome! Let&apos;s set up your store.</h1>
      <p className="text-muted-foreground mb-8">
        Complete these steps to start receiving orders.
      </p>
      <ShopOnboardingClient
        userId={user.id}
        completedSteps={progress?.completed_steps || []}
        dismissed={progress?.dismissed || false}
      />
    </div>
  )
}
