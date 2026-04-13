import { requireRole } from '@/lib/auth'
import AgencySidebar from '@/components/agency/AgencySidebar'

export const dynamic = 'force-dynamic'

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('agency_owner', '/login')

  return (
    <AgencySidebar user={user}>
      {children}
    </AgencySidebar>
  )
}
