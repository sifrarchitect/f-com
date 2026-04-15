import { createClient } from '@/lib/supabase/server'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Order } from '@/types/database'
import { notFound } from 'next/navigation'
import { Package, Truck, Check, Clock, X } from 'lucide-react'

async function getOrder(orderNumber: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('order_number, customer_name, customer_phone, delivery_status, payment_status, total_price, delivery_fee, delivery_zone, steadfast_tracking_code, created_at')
    .eq('order_number', orderNumber)
    .single()
  return data as Partial<Order> | null
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped to Courier', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
]

function getStepIndex(status: string) {
  const idx = statusSteps.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : -1
}

export default async function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const order = await getOrder(orderNumber)
  if (!order) notFound()

  const currentStep = order.delivery_status === 'cancelled' ? -1 : getStepIndex(order.delivery_status || 'pending')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-center mb-2">Track Your Order</h1>
        <p className="text-center text-sm text-muted-foreground font-mono mb-8">{order.order_number}</p>

        {order.delivery_status === 'cancelled' ? (
          <div className="fm-card p-6 text-center">
            <X className="h-12 w-12 text-fm-destructive mx-auto mb-3" />
            <p className="text-lg font-semibold text-fm-destructive">Order Cancelled</p>
            <p className="text-sm text-muted-foreground mt-2">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="fm-card p-6">
            <div className="space-y-0">
              {statusSteps.map((step, i) => {
                const isActive = i <= currentStep
                const isCurrent = i === currentStep
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-fm-success text-background' : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-fm-success/30' : ''}`}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${isActive ? 'bg-fm-success' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="pt-1 pb-4">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {order.steadfast_tracking_code && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Steadfast Tracking</p>
                <p className="text-sm font-mono mt-1">{order.steadfast_tracking_code}</p>
              </div>
            )}
          </div>
        )}

        <div className="fm-card p-5 mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span>{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold">{formatBDT(order.total_price || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
              order.payment_status === 'verified' ? 'fm-badge-success' : 'fm-badge-warning'
            }`}>{order.payment_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-xs">{formatDate(order.created_at || '')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
