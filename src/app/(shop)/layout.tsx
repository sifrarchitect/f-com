import { requireRole } from '@/lib/auth'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette'
import { createClient } from '@/lib/supabase/server'
import ShopOnboardingClient from '@/app/(shop)/dashboard/onboarding/ShopOnboardingClient'
import { redirect } from 'next/navigation'
import type { Shop } from '@/types/database'

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

  const supabase = await createClient()

  const [shopRes, productsRes, ordersRes, progressRes] = await Promise.all([
    supabase.from('shops').select('*').eq('id', user.shopId).single(),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', user.shopId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('shop_id', user.shopId),
    supabase.from('onboarding_progress').select('dismissed').eq('user_id', user.id).eq('role', 'shop').single()
  ])

  const shop = shopRes.data as unknown as Shop
  const shopError = shopRes.error

  if (shopError || !shop) {
    redirect('/login')
  }

  // Auto-detect completions directly from actual backend facts
  const completedSteps: string[] = []
  if (productsRes.count && productsRes.count > 0) completedSteps.push('first_product')
  if (ordersRes.count && ordersRes.count > 0) completedSteps.push('first_order')
  if (shop.bkash_merchant_number || shop.nagad_merchant_number) completedSteps.push('payment_setup')
  if (shop.banner_url || shop.banner_text_title || shop.contact_phone) completedSteps.push('store_customized')

  const dismissed = (progressRes.data as { dismissed?: boolean } | null)?.dismissed || false

  return (
    <ShopSidebar user={user}>
      {children}
      <ShopOnboardingClient userId={user.id} completedSteps={completedSteps} dismissed={dismissed} />
      <GlobalCommandPalette type="shop" />
    </ShopSidebar>
  )
}
