import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import type { Shop, AgencyPlan } from '@/types/database'
import Link from 'next/link'
import { Store } from 'lucide-react'
import ShopActions from './ShopActions'
import { AddShopButton } from '@/components/agency/ShopActions'

async function getShops(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shops')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  return (data || []) as Shop[]
}

async function getPlans(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agency_plans')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('is_active', true)
    .order('price', { ascending: true })
  return (data || []) as AgencyPlan[]
}

export default async function ShopsPage() {
  const user = await getUser()
  if (!user?.agencyId) return null

  const [shops, plans] = await Promise.all([
    getShops(user.agencyId),
    getPlans(user.agencyId),
  ])

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
          <p className="text-sm text-muted-foreground mt-1">{shops.length} shops managed</p>
        </div>
        <AddShopButton plans={plans} />
      </div>

      <div className="fm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Shop</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Store className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No shops yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Add your first seller to get started</p>
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3">
                      <Link href={`/agency/shops/${shop.id}`} className="flex items-center gap-2 hover:underline">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: shop.primary_color + '20', color: shop.primary_color }}>
                          <Store className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{shop.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{shop.owner_email || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{shop.slug}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(shop.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${shop.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
                        {shop.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ShopActions shopId={shop.id} isActive={shop.is_active} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
