import { requireRole } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('super_admin', '/login')

  return (
    <AdminSidebar user={user}>
      {children}
      <GlobalCommandPalette type="admin" />
    </AdminSidebar>
  )
}
