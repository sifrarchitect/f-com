import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Order } from '@/types/database'
import { ShoppingCart, Download } from 'lucide-react'

async function getAgencyOrders(agencyId: string) {
  const supabase = await createClient()
  const { data: shops } = await supabase.from('shops').select('id').eq('agency_id', agencyId)
  const shopIds = (shops || []).map((s: { id: string }) => s.id)
  if (shopIds.length === 0) return []

  const { data } = await supabase
    .from('orders')
    .select('*')
    .in('shop_id', shopIds)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data || []) as Order[]
}

export default async function AgencyOrdersPage() {
  const user = await getUser()
  if (!user?.agencyId) return null

  const orders = await getAgencyOrders(user.agencyId)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Cross-shop unified view · {orders.length} orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((filter) => (
          <button key={filter} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'All' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent text-muted-foreground'
          }`}>{filter}</button>
        ))}
      </div>

      <div className="fm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order #</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No orders yet</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3 font-mono text-xs font-medium">{order.order_number}</td>
                    <td className="px-5 py-3">{order.customer_name}</td>
                    <td className="px-5 py-3 font-mono">{formatBDT(order.total_price)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        order.payment_status === 'verified' ? 'fm-badge-success' :
                        order.payment_status === 'failed' ? 'fm-badge-destructive' : 'fm-badge-warning'
                      }`}>{order.payment_status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        order.delivery_status === 'delivered' ? 'fm-badge-success' :
                        order.delivery_status === 'cancelled' ? 'fm-badge-destructive' :
                        order.delivery_status === 'shipped' ? 'fm-badge-warning' : 'fm-badge-neutral'
                      }`}>{order.delivery_status}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(order.created_at)}</td>
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
