import { requireRole } from '@/lib/auth'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('shop_owner', '/login')

  if (!user.shopId) {
    redirect('/login')
  }

  // Verify shop exists
  const supabase = await createClient()
  const { error } = await supabase.from('shops').select('id').eq('id', user.shopId).single()
  if (error) {
    redirect('/login')
  }

  return (
    <ShopSidebar user={user}>
      {children}
      <GlobalCommandPalette type="shop" />
    </ShopSidebar>
  )
}
