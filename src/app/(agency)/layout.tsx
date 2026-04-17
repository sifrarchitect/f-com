import { requireRole } from '@/lib/auth'
import AgencySidebar from '@/components/agency/AgencySidebar'
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette'
import { createClient } from '@/lib/supabase/server'
import AgencyOnboardingClient from '@/app/(agency)/agency/onboarding/AgencyOnboardingClient'
import { redirect } from 'next/navigation'
import type { Agency } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('agency_owner', '/login')

  if (!user.agencyId) {
    redirect('/login')
  }

  const supabase = await createClient()

  const [agencyRes, shopsRes, plansRes, progressRes] = await Promise.all([
    supabase.from('agencies').select('*').eq('id', user.agencyId).single(),
    supabase.from('shops').select('id', { count: 'exact', head: true }).eq('agency_id', user.agencyId),
    supabase.from('agency_plans').select('id', { count: 'exact', head: true }).eq('agency_id', user.agencyId),
    supabase.from('onboarding_progress').select('dismissed').eq('user_id', user.id).eq('role', 'agency').single()
  ])

  const agency = agencyRes.data as unknown as Agency
  const agencyError = agencyRes.error

  if (agencyError || !agency) {
    redirect('/login')
  }

  // Auto-detect completions — IDs MUST match AgencyOnboarding.tsx STEPS
  const completedSteps: string[] = []
  if (agency.logo_url || agency.custom_domain) completedSteps.push('branding')
  if (plansRes.count && plansRes.count > 0) completedSteps.push('first_plan')
  if (shopsRes.count && shopsRes.count > 0) completedSteps.push('first_shop')

  const dismissed = (progressRes.data as { dismissed?: boolean } | null)?.dismissed || false

  return (
    <AgencySidebar user={user}>
      {children}
      <AgencyOnboardingClient userId={user.id} completedSteps={completedSteps} dismissed={dismissed} />
      <GlobalCommandPalette type="agency" />
    </AgencySidebar>
  )
}
