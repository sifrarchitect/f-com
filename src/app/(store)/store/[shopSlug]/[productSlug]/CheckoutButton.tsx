'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Minus, Plus, ChevronDown, Check, Loader2, X } from 'lucide-react'
import { placeOrder } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase/client'
import type { VariantType, VariantOption } from '@/types/database'

interface CheckoutButtonProps {
  shopSlug: string
  productId: string
  productName: string
  basePrice: number
  inStock: boolean
  brandColor: string
  hasVariants: boolean
  variants: VariantType[]
  simpleStock: number
  bkashNumber: string | null
  nagadNumber: string | null
  rocketNumber: string | null
  deliveryFeeInside: number
  deliveryFeeOutside: number
  activeDiscountPercent?: number | null
  shopId: string
}

type CheckoutStep = 'idle' | 'form' | 'submitting' | 'verifying' | 'verified' | 'failed'

export default function CheckoutButton({
  shopSlug, productId, productName, basePrice, inStock, brandColor,
  hasVariants, variants, simpleStock,
  bkashNumber, nagadNumber, rocketNumber,
  deliveryFeeInside, deliveryFeeOutside,
  activeDiscountPercent, shopId,
}: CheckoutButtonProps) {
  const [step, setStep] = useState<CheckoutStep>('idle')
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka')
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  // Compute effective price with variant modifier and discount
  const getVariantOption = useCallback((): VariantOption | null => {
    if (!hasVariants || variants.length === 0) return null
    const firstType = variants[0]
    const selectedVal = selectedVariants[firstType.type]
    if (!selectedVal) return null
    return firstType.options.find(o => o.value === selectedVal) || null
  }, [hasVariants, variants, selectedVariants])

  const variantOption = getVariantOption()
  const rawPrice = basePrice + (variantOption?.price_modifier || 0)
  const discountedPrice = activeDiscountPercent
    ? Math.round(rawPrice * (1 - activeDiscountPercent / 100))
    : rawPrice
  const deliveryFee = deliveryZone === 'inside_dhaka' ? deliveryFeeInside : deliveryFeeOutside
  const totalPrice = discountedPrice * quantity + deliveryFee

  const availablePayments = [
    { key: 'bkash' as const, label: 'bKash', number: bkashNumber, color: '#E2136E' },
    { key: 'nagad' as const, label: 'Nagad', number: nagadNumber, color: '#F6821F' },
    { key: 'rocket' as const, label: 'Rocket', number: rocketNumber, color: '#8B3FC2' },
  ].filter(p => p.number)

  // Auto-select first payment method
  useEffect(() => {
    if (availablePayments.length > 0 && !paymentMethod) {
      setPaymentMethod(availablePayments[0].key)
    }
  }, [availablePayments.length])

  // Stock check
  const stockAvailable = hasVariants
    ? (variantOption ? variantOption.stock >= quantity : true)
    : simpleStock >= quantity

  // Realtime subscription when verifying
  useEffect(() => {
    if (step !== 'verifying' || !orderId) return

    const supabase = createClient()
    const channel = supabase.channel(`order-verify-${orderId}`)
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`,
    }, (payload) => {
      const newStatus = (payload.new as { payment_status: string }).payment_status
      if (newStatus === 'verified') setStep('verified')
      else if (newStatus === 'failed') setStep('failed')
    }).subscribe()

    // 10-minute timeout — show tracking link
    const timeout = setTimeout(() => {
      if (step === 'verifying') setStep('verified') // show order number even on timeout
    }, 10 * 60 * 1000)

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeout)
    }
  }, [step, orderId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setStep('submitting')

    const fd = new FormData(e.currentTarget)
    fd.set('product_id', productId)
    fd.set('quantity', String(quantity))
    if (hasVariants && variants.length > 0) {
      const firstVariant = variants[0]
      fd.set('variant_type', firstVariant.type)
      fd.set('variant_value', selectedVariants[firstVariant.type] || '')
    }

    const result = await placeOrder(fd)

    if (result.error) {
      setError(result.error)
      setStep('form')
      return
    }

    setOrderId(result.data!.id)
    setOrderNumber(result.data!.order_number)
    setStep('verifying')
  }

  // ── Verified state ──────────────────────────────────────────────
  if (step === 'verified') {
    return (
      <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5 text-center space-y-3 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-lg font-bold text-green-500">Payment Verified!</p>
        <p className="text-sm text-muted-foreground">Your order <strong className="font-mono">{orderNumber}</strong> is confirmed.</p>
        <a
          href={`/track/${orderNumber}`}
          className="inline-block mt-2 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
        >
          Track Order →
        </a>
      </div>
    )
  }

  // ── Verifying state ─────────────────────────────────────────────
  if (step === 'verifying') {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground animate-pulse" />
        </div>
        <div>
          <p className="font-semibold">Verifying Payment…</p>
          <p className="text-sm text-muted-foreground mt-1">
            Order <span className="font-mono font-medium">{orderNumber}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This is automatic. Please keep this page open.
          </p>
        </div>
        <a href={`/track/${orderNumber}`} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
          View order status →
        </a>
      </div>
    )
  }

  // ── Idle — show buy button ──────────────────────────────────────
  if (step === 'idle') {
    return (
      <div className="space-y-4">
        {/* Variant selector */}
        {hasVariants && variants.map(vType => (
          <div key={vType.id}>
            <p className="text-sm font-medium mb-2">{vType.type}</p>
            <div className="flex flex-wrap gap-2">
              {vType.options.map(opt => {
                const selected = selectedVariants[vType.type] === opt.value
                const outOfStock = opt.stock === 0
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, [vType.type]: opt.value }))}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                      selected
                        ? 'border-2 font-semibold'
                        : outOfStock
                          ? 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                          : 'border-border hover:border-foreground/40'
                    }`}
                    style={selected ? { borderColor: brandColor, color: brandColor } : {}}
                  >
                    {opt.value}
                    {opt.price_modifier !== 0 && (
                      <span className="ml-1 text-xs opacity-60">
                        {opt.price_modifier > 0 ? `+${opt.price_modifier}` : opt.price_modifier}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Quantity:</span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Price display */}
        <div className="text-2xl font-bold" style={{ color: brandColor }}>
          BDT {(discountedPrice * quantity).toLocaleString()}
          {activeDiscountPercent && (
            <span className="ml-2 text-sm text-muted-foreground line-through font-normal">
              BDT {(rawPrice * quantity).toLocaleString()}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setStep('form')}
          disabled={!inStock || !stockAvailable || (hasVariants && Object.keys(selectedVariants).length < variants.length)}
          className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: brandColor, color: '#fff' }}
        >
          <ShoppingCart className="h-4 w-4" />
          {!inStock ? 'Out of Stock' : 'Order Now'}
        </button>
      </div>
    )
  }

  // ── Checkout form ───────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold">Complete Your Order</h3>
        <button type="button" onClick={() => setStep('idle')} className="p-1 hover:bg-accent rounded-md transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
          <input name="customer_name" required minLength={2}
            className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Phone Number *</label>
          <input name="customer_phone" required type="tel" placeholder="01XXXXXXXXX"
            className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email (optional)</label>
          <input name="customer_email" type="email"
            className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Delivery Address *</label>
          <textarea name="customer_address" required rows={2}
            className="w-full px-3 py-2 mt-1 rounded-lg bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Delivery Zone */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Delivery Zone *</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(['inside_dhaka', 'outside_dhaka'] as const).map(zone => (
              <button
                key={zone}
                type="button"
                onClick={() => setDeliveryZone(zone)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  deliveryZone === zone ? 'border-2 font-semibold' : 'border-border'
                }`}
                style={deliveryZone === zone ? { borderColor: brandColor, color: brandColor } : {}}
              >
                {zone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                <br />
                <span className="font-mono font-bold">
                  BDT {zone === 'inside_dhaka' ? deliveryFeeInside : deliveryFeeOutside}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="delivery_zone" value={deliveryZone} />
        </div>

        {/* Payment Method */}
        {availablePayments.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Payment Method *</label>
            <div className="flex gap-2 mt-1">
              {availablePayments.map(pm => (
                <button
                  key={pm.key}
                  type="button"
                  onClick={() => setPaymentMethod(pm.key)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === pm.key ? 'border-2 text-white' : 'border-border'
                  }`}
                  style={paymentMethod === pm.key ? { backgroundColor: pm.color, borderColor: pm.color } : {}}
                >
                  {pm.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="payment_method" value={paymentMethod || ''} />

            {/* Show merchant number */}
            {paymentMethod && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-sm text-center">
                <p className="text-xs text-muted-foreground">Send payment to</p>
                <p className="font-mono font-bold text-lg mt-0.5">
                  {availablePayments.find(p => p.key === paymentMethod)?.number}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  BDT <span className="font-bold">{totalPrice.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground">Transaction ID (TrxID) *</label>
          <input name="payment_trx_id" required minLength={8}
            placeholder="Enter your bKash/Nagad TrxID"
            className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="text-xs text-muted-foreground">Note (optional)</div>
        <input name="notes"
          className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring -mt-2" />
      </div>

      {/* Order Summary */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{productName} × {quantity}</span>
          <span className="font-medium">BDT {(discountedPrice * quantity).toLocaleString()}</span>
        </div>
        {activeDiscountPercent && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({activeDiscountPercent}%)</span>
            <span>-BDT {((rawPrice - discountedPrice) * quantity).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery fee</span>
          <span>BDT {deliveryFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-border pt-1.5 mt-1.5">
          <span>Total</span>
          <span>BDT {totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={step === 'submitting' || !paymentMethod}
        className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
        style={{ backgroundColor: brandColor, color: '#fff' }}
      >
        {step === 'submitting' ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
        ) : (
          <><Check className="h-4 w-4" /> Confirm Order</>
        )}
      </button>
    </form>
  )
}
