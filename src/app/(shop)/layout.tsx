import { requireRole } from '@/lib/auth'
import ShopSidebar from '@/components/shop/ShopSidebar'

export const dynamic = 'force-dynamic'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('shop_owner', '/login')

  return (
    <ShopSidebar user={user}>
      {children}
    </ShopSidebar>
  )
}
