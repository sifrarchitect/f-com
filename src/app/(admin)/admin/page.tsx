import { createClient } from '@/lib/supabase/server'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Agency, Shop, Order, Invoice } from '@/types/database'
import Link from 'next/link'
import {
  Building2, Store, ShoppingCart, Receipt,
  TrendingUp, AlertTriangle,
} from 'lucide-react'
import DoomsdayButton from '@/components/admin/DoomsdayButton'
import { AdminRevenueChart } from '@/components/charts/AdminRevenueChart'
import { AdminAgenciesChart } from '@/components/charts/AdminAgenciesChart'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

async function getStats() {
  const supabase = await createClient()

  const [agencies, shops, orders, invoices] = await Promise.all([
    supabase.from('agencies').select('id, is_active', { count: 'exact' }),
    supabase.from('shops').select('id, is_active', { count: 'exact' }),
    supabase.from('orders').select('id, total_price, created_at', { count: 'exact' }),
    supabase.from('invoices').select('id, amount_bdt, status', { count: 'exact' }),
  ])

  const agencyList = (agencies.data || []) as Pick<Agency, 'id' | 'is_active'>[]
  const shopList = (shops.data || []) as Pick<Shop, 'id' | 'is_active'>[]
  const orderList = (orders.data || []) as Pick<Order, 'id' | 'total_price' | 'created_at'>[]
  const invoiceList = (invoices.data || []) as Pick<Invoice, 'id' | 'amount_bdt' | 'status'>[]

  const totalRevenue = orderList.reduce((sum, o) => sum + (o.total_price || 0), 0)
  const unpaidInvoices = invoiceList.filter((i) => i.status === 'unpaid')
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (i.amount_bdt || 0), 0)

  // Generate 7-day revenue trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().split('T')[0].slice(5), revenue: 0, fullDate: d.toISOString().split('T')[0] }
  })

  orderList.forEach((o) => {
    const dateStr = (o.created_at as string).split('T')[0]
    const day = last7Days.find((d) => d.fullDate === dateStr)
    if (day) day.revenue += (o.total_price || 0)
  })

  return {
    totalAgencies: agencyList.length,
    activeAgencies: agencyList.filter((a) => a.is_active).length,
    totalShops: shopList.length,
    activeShops: shopList.filter((s) => s.is_active).length,
    totalOrders: orderList.length,
    totalRevenue,
    unpaidInvoiceCount: unpaidInvoices.length,
    unpaidAmount,
    revenueChartData: last7Days,
  }
}

async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total_price, payment_status, delivery_status, created_at')
    .order('created_at', { ascending: false })
    .limit(8)
  return (data || []) as Order[]
}

async function getTopAgencies() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agencies')
    .select('id, name, slug, is_active')
    .order('created_at', { ascending: true })
    .limit(5)
  return (data || []) as Agency[]
}

export default async function AdminDashboard() {
  const [stats, recentOrders, topAgencies] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getTopAgencies(),
  ])

  const kpiCards = [
    { label: 'Total Agencies', value: stats.totalAgencies, sub: `${stats.activeAgencies} active`, icon: Building2, color: 'text-foreground' },
    { label: 'Total Shops', value: stats.totalShops, sub: `${stats.activeShops} active`, icon: Store, color: 'text-foreground' },
    { label: 'Total Orders', value: stats.totalOrders, sub: 'all time', icon: ShoppingCart, color: 'text-foreground' },
    { label: 'Total Revenue', value: stats.totalRevenue, sub: 'platform-wide', icon: TrendingUp, color: 'text-fm-success' },
    { label: 'Unpaid Invoices', value: stats.unpaidAmount, sub: `${stats.unpaidInvoiceCount} total unpaid invoices`, icon: Receipt, color: stats.unpaidInvoiceCount > 0 ? 'text-fm-warning' : 'text-foreground' },
    { label: 'Platform Health', value: stats.activeAgencies > 0 ? 'Healthy' : 'Setup Needed', sub: stats.activeAgencies > 0 ? 'All systems normal' : 'No active agencies', icon: AlertTriangle, color: stats.activeAgencies > 0 ? 'text-fm-success' : 'text-fm-warning' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview — Super Admin</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="fm-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <div className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {typeof card.value === 'number' ? (
                    <AnimatedCounter 
                      value={card.value} 
                      type={card.label === 'Total Revenue' || card.label === 'Unpaid Invoices' ? 'currency' : 'number'}
                      delay={200}
                    />
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="fm-card p-5">
          <h2 className="text-sm font-semibold mb-2">Platform Revenue (7d)</h2>
          <AdminRevenueChart data={stats.revenueChartData} />
        </div>
        <div className="fm-card p-5">
          <h2 className="text-sm font-semibold mb-2">Top Agencies</h2>
          <AdminAgenciesChart 
            data={topAgencies.map((a) => ({ 
              name: a.name.slice(0, 10), 
              active: a.is_active ? 1 : 0, 
              suspended: a.is_active ? 0 : 1 
            }))} 
          />
        </div>
      </div>

      {/* Two columns: Recent Orders + Top Agencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 fm-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No orders yet</td>
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
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          order.delivery_status === 'delivered' ? 'fm-badge-success' :
                          order.delivery_status === 'cancelled' ? 'fm-badge-destructive' :
                          order.delivery_status === 'shipped' ? 'fm-badge-warning' : 'fm-badge-neutral'
                        }`}>
                          {order.delivery_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Agencies */}
        <div className="fm-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold">Agencies</h2>
            <Link href="/admin/agencies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {topAgencies.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">No agencies yet</div>
            ) : (
              topAgencies.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/admin/agencies/${agency.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agency.name}</p>
                    <p className="text-xs text-muted-foreground">{agency.slug}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${agency.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
                    {agency.is_active ? 'Active' : 'Inactive'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Doomsday Kill Switch */}
      <DoomsdayButton />
    </div>
  )
}
