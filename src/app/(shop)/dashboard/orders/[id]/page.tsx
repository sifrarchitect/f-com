import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Order } from '@/types/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, CreditCard, Truck, User } from 'lucide-react'
import { SteadfastButton, CancelOrderButton, BlacklistButton, PrintSlipButton } from '@/components/shop/OrderActions'

async function getOrder(orderId: string, shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('shop_id', shopId)
    .single()
  return data as Order | null
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser()
  if (!user?.shopId) return null

  const order = await getOrder(id, user.shopId)
  if (!order) notFound()

  const canSendToSteadfast = order.payment_status === 'verified' && (order.delivery_status === 'pending' || order.delivery_status === 'processing') && !order.steadfast_consignment_id
  const canCancel = order.delivery_status !== 'delivered' && order.delivery_status !== 'cancelled'

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PrintSlipButton />
          {canSendToSteadfast && <SteadfastButton orderId={order.id} />}
          {canCancel && <CancelOrderButton orderId={order.id} />}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
          <span className={`inline-flex px-2.5 py-1 rounded text-sm font-medium ${
            order.payment_status === 'verified' ? 'fm-badge-success' :
            order.payment_status === 'failed' ? 'fm-badge-destructive' : 'fm-badge-warning'
          }`}>{order.payment_status}</span>
          {order.payment_method && <p className="text-xs text-muted-foreground mt-2">via {order.payment_method}</p>}
          {order.payment_trx_id && <p className="text-xs font-mono text-muted-foreground mt-0.5">TrxID: {order.payment_trx_id}</p>}
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Delivery</p>
          <span className={`inline-flex px-2.5 py-1 rounded text-sm font-medium ${
            order.delivery_status === 'delivered' ? 'fm-badge-success' :
            order.delivery_status === 'cancelled' ? 'fm-badge-destructive' :
            order.delivery_status === 'shipped' ? 'fm-badge-warning' : 'fm-badge-neutral'
          }`}>{order.delivery_status}</span>
          {order.steadfast_tracking_code && (
            <p className="text-xs font-mono text-muted-foreground mt-2">Tracking: {order.steadfast_tracking_code}</p>
          )}
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Zone</p>
          <p className="text-sm font-medium">{order.delivery_zone === 'inside_dhaka' ? '📍 Inside Dhaka' : '📍 Outside Dhaka'}</p>
          <p className="text-xs text-muted-foreground mt-1">Delivery: {formatBDT(order.delivery_fee)}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total</p>
          <p className="text-2xl font-bold text-fm-success">{formatBDT(order.total_price)}</p>
          <p className="text-xs text-muted-foreground mt-1">Qty: {order.quantity} × {formatBDT(order.unit_price)}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="fm-card p-5 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Customer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-mono">{order.customer_phone}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Address</p>
            <p>{order.customer_address}</p>
          </div>
        </div>
        <BlacklistButton phone={order.customer_phone} customerName={order.customer_name} />
      </div>

      {/* Cancellation */}
      {order.cancelled_at && (
        <div className="fm-card p-5 border-destructive/20">
          <h2 className="text-sm font-semibold text-destructive mb-2">Cancelled</h2>
          <p className="text-sm text-muted-foreground">{order.cancellation_reason || 'No reason provided'}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(order.cancelled_at)}</p>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="fm-card p-5">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
