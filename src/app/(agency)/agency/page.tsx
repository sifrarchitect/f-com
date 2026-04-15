import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Shop, Order, Invoice } from '@/types/database'
import Link from 'next/link'
import {
  Store, ShoppingCart, TrendingUp, Receipt, AlertTriangle,
} from 'lucide-react'

async function getAgencyStats(agencyId: string) {
  const supabase = await createClient()

  const [shopsRes, ordersRes, invoicesRes] = await Promise.all([
    supabase.from('shops').select('id, is_active').eq('agency_id', agencyId),
    supabase.from('orders').select('id, total_price, payment_status, delivery_status, shop_id, created_at')
      .in('shop_id', (await supabase.from('shops').select('id').eq('agency_id', agencyId)).data?.map((s: { id: string }) => s.id) || []),
    supabase.from('invoices').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false }),
  ])

  const shops = (shopsRes.data || []) as Pick<Shop, 'id' | 'is_active'>[]
  const orders = (ordersRes.data || []) as Order[]
  const invoices = (invoicesRes.data || []) as Invoice[]

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
  const pendingPayments = orders.filter((o) => o.payment_status === 'pending').length
  const latestInvoice = invoices[0] || null

  return {
    totalShops: shops.length,
    activeShops: shops.filter((s) => s.is_active).length,
    totalOrders: orders.length,
    totalRevenue,
    pendingPayments,
    latestInvoice,
    orders,
  }
}

export default async function AgencyDashboard() {
  const user = await getUser()
  if (!user?.agencyId) return null

  const stats = await getAgencyStats(user.agencyId)

  const kpiCards = [
    { label: 'Total Shops', value: stats.totalShops, sub: `${stats.activeShops} active`, icon: Store },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), sub: 'across all shops', icon: ShoppingCart },
    { label: 'Revenue', value: formatBDT(stats.totalRevenue), sub: 'total earnings', icon: TrendingUp, color: 'text-fm-success' },
    { label: 'Pending Payments', value: stats.pendingPayments, sub: 'awaiting verification', icon: AlertTriangle, color: stats.pendingPayments > 0 ? 'text-fm-warning' : 'text-foreground' },
    { label: 'Platform Fee', value: formatBDT(stats.activeShops * 100), sub: `${stats.activeShops} × BDT 100/mo`, icon: Receipt },
  ]

  // Recent orders (last 8)
  const recentOrders = stats.orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Agency overview</p>
      </div>

      {/* Platform fee alert */}
      {stats.latestInvoice && stats.latestInvoice.status === 'unpaid' && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-fm-warning/30 bg-fm-warning/5">
          <AlertTriangle className="h-5 w-5 text-fm-warning shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Unpaid Invoice</p>
            <p className="text-xs text-muted-foreground">
              {new Date(stats.latestInvoice.year, stats.latestInvoice.month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })} — {formatBDT(stats.latestInvoice.amount_bdt)}
            </p>
          </div>
          <Link href="/agency/billing" className="text-xs font-medium text-fm-warning hover:underline">View →</Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="fm-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color || 'text-foreground'}`}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="fm-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Link href="/agency/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3 font-mono text-xs">{order.order_number}</td>
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
