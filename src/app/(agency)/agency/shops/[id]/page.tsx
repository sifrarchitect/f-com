import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Shop, Order } from '@/types/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Store, ArrowLeft, CreditCard, Truck, Phone } from 'lucide-react'

async function getShopWithOrders(shopId: string, agencyId: string) {
  const supabase = await createClient()
  const [shopRes, ordersRes] = await Promise.all([
    supabase.from('shops').select('*').eq('id', shopId).eq('agency_id', agencyId).single(),
    supabase.from('orders').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(10),
  ])
  return {
    shop: shopRes.data as Shop | null,
    orders: (ordersRes.data || []) as Order[],
  }
}

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser()
  if (!user?.agencyId) return null

  const { shop, orders } = await getShopWithOrders(id, user.agencyId)
  if (!shop) notFound()

  const totalRevenue = orders.reduce((s, o) => s + o.total_price, 0)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Link href="/agency/shops" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Shops
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: shop.primary_color + '20', color: shop.primary_color }}>
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{shop.slug}</p>
        </div>
        <span className={`ml-auto inline-flex px-2.5 py-1 rounded text-xs font-medium ${shop.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
          {shop.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold mt-1 text-fm-success">{formatBDT(totalRevenue)}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</p>
          <div className="flex items-center gap-2 mt-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{shop.ruxspeed_enabled ? 'RuxSpeed ON' : 'Manual'}</span>
          </div>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery</p>
          <div className="mt-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">Inside: {formatBDT(shop.delivery_fee_inside_dhaka)}</p>
            <p className="text-xs text-muted-foreground">Outside: {formatBDT(shop.delivery_fee_outside_dhaka)}</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      {(shop.contact_phone || shop.contact_whatsapp) && (
        <div className="fm-card p-5 flex items-center gap-4">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-6 text-sm text-muted-foreground">
            {shop.contact_phone && <span>Phone: {shop.contact_phone}</span>}
            {shop.contact_whatsapp && <span>WhatsApp: {shop.contact_whatsapp}</span>}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="fm-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">No orders yet</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-5 py-3">{o.customer_name}</td>
                    <td className="px-5 py-3 font-mono">{formatBDT(o.total_price)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        o.delivery_status === 'delivered' ? 'fm-badge-success' :
                        o.delivery_status === 'cancelled' ? 'fm-badge-destructive' : 'fm-badge-neutral'
                      }`}>{o.delivery_status}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
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
