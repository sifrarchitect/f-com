import { requireRole } from '@/lib/auth'
import AgencySidebar from '@/components/agency/AgencySidebar'
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  // Verify agency exists
  const supabase = await createClient()
  const { error } = await supabase.from('agencies').select('id').eq('id', user.agencyId).single()
  if (error) {
    redirect('/login')
  }

  return (
    <AgencySidebar user={user}>
      {children}
      <GlobalCommandPalette type="agency" />
    </AgencySidebar>
  )
}
