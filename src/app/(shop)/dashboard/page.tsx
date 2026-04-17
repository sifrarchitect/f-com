import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Order, Product } from '@/types/database'
import Link from 'next/link'
import {
  ShoppingCart, Package, TrendingUp, CreditCard, AlertTriangle, Truck,
} from 'lucide-react'
import { AdminRevenueChart as RevenueChart } from '@/components/charts/AdminRevenueChart'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

async function getShopStats(shopId: string) {
  const supabase = await createClient()

  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('*').eq('shop_id', shopId),
    supabase.from('products').select('id, name, simple_stock, is_active').eq('shop_id', shopId),
  ])

  const orders = (ordersRes.data || []) as Order[]
  const products = (productsRes.data || []) as Pick<Product, 'id' | 'name' | 'simple_stock' | 'is_active'>[]

  const totalRevenue = orders.reduce((s, o) => s + o.total_price, 0)
  const pendingOrders = orders.filter((o) => o.delivery_status === 'pending').length
  const verifiedPayments = orders.filter((o) => o.payment_status === 'verified').length
  const lowStock = products.filter((p) => p.simple_stock < 5 && p.is_active)

  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  // Generate 7-day revenue trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().split('T')[0].slice(5), revenue: 0, fullDate: d.toISOString().split('T')[0] }
  })

  orders.forEach((o) => {
    const dateStr = (o.created_at as string).split('T')[0]
    const day = last7Days.find((d) => d.fullDate === dateStr)
    if (day) day.revenue += (o.total_price || 0)
  })

  return { orders, products, totalRevenue, pendingOrders, verifiedPayments, lowStock, recentOrders, revenueChartData: last7Days }
}

export default async function ShopDashboard() {
  const user = await getUser()
  if (!user?.shopId) return null

  const stats = await getShopStats(user.shopId)

  const kpiCards = [
    { label: 'Total Orders', value: stats.orders.length, sub: `${stats.pendingOrders} pending`, icon: ShoppingCart },
    { label: 'Products', value: stats.products.length, sub: `${stats.products.filter((p) => p.is_active).length} active`, icon: Package },
    { label: 'Revenue', value: stats.totalRevenue, sub: 'all time', icon: TrendingUp, color: 'text-fm-success' },
    { label: 'Verified Payments', value: stats.verifiedPayments, sub: `of ${stats.orders.length} orders`, icon: CreditCard },
    { label: 'Pending Delivery', value: stats.pendingOrders, sub: 'to process', icon: Truck, color: stats.pendingOrders > 0 ? 'text-fm-warning' : 'text-foreground' },
    { label: 'Low Stock', value: stats.lowStock.length, sub: 'items below 5', icon: AlertTriangle, color: stats.lowStock.length > 0 ? 'text-fm-destructive' : 'text-foreground' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your shop overview</p>
      </div>

      {/* Low stock alert */}
      {stats.lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-fm-destructive/30 bg-fm-destructive/5">
          <AlertTriangle className="h-5 w-5 text-fm-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Low Stock Alert</p>
            <p className="text-xs text-muted-foreground">
              {stats.lowStock.map(p => p.name).join(', ')} — below 5 units
            </p>
          </div>
          <Link href="/dashboard/products" className="text-xs font-medium text-fm-destructive hover:underline">Manage →</Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="fm-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <div className={`text-2xl font-bold mt-1 ${card.color || 'text-foreground'}`}>
                  {typeof card.value === 'number' ? (
                    <AnimatedCounter 
                      value={card.value} 
                      type={card.label === 'Revenue' ? 'currency' : 'number'}
                      delay={200}
                    />
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 fm-card p-5">
        <h2 className="text-sm font-semibold mb-2">Shop Revenue (7d)</h2>
        <div className="h-[300px]">
          <RevenueChart data={stats.revenueChartData} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="fm-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
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
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">No orders yet — share your store link!</td></tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3"><Link href={`/dashboard/orders/${order.id}`} className="font-mono text-xs font-medium hover:underline">{order.order_number}</Link></td>
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
