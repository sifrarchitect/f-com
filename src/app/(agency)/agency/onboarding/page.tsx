import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { OnboardingProgress } from '@/types/database'
import AgencyOnboardingClient from './AgencyOnboardingClient'

export default async function AgencyOnboardingPage() {
  const user = await getUser()
  if (!user || user.role !== 'agency_owner') redirect('/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'agency')
    .single()

  const progress = data as OnboardingProgress | null

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-2">Welcome! Let&apos;s set up your agency.</h1>
      <p className="text-muted-foreground mb-8">
        Complete these steps to get your platform ready for sellers.
      </p>
      <AgencyOnboardingClient
        userId={user.id}
        completedSteps={progress?.completed_steps || []}
        dismissed={progress?.dismissed || false}
      />
    </div>
  )
}
