'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'

interface CheckoutButtonProps {
  shopSlug: string
  productId: string
  productName: string
  price: number
  inStock: boolean
  brandColor: string
}

export default function CheckoutButton({
  shopSlug, productId, productName, price, inStock, brandColor,
}: CheckoutButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="p-6 rounded-lg border border-fm-success/30 bg-fm-success/5 text-center">
        <p className="text-lg font-semibold text-fm-success">✓ অর্ডার সম্পন্ন!</p>
        <p className="text-sm text-muted-foreground mt-2">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
      </div>
    )
  }

  if (!showForm) {
    return (
      <div className="space-y-3">
        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">পরিমাণ:</span>
          <div className="flex items-center border border-border rounded-md">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-accent transition-colors">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-medium">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-accent transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">= ৳{(price * quantity).toLocaleString()}</span>
        </div>

        <button
          onClick={() => setShowForm(true)}
          disabled={!inStock}
          className="w-full py-3.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: inStock ? brandColor : undefined, color: inStock ? '#0A0A0A' : undefined }}
        >
          <ShoppingCart className="h-4 w-4" />
          {inStock ? 'অর্ডার করুন' : 'স্টক শেষ'}
        </button>
      </div>
    )
  }

  // Checkout form
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setSubmitting(true)
        // In production, this calls a server action to create the order
        await new Promise((r) => setTimeout(r, 1000))
        setSubmitted(true)
      }}
      className="space-y-4 p-5 rounded-lg border border-border bg-card"
    >
      <h3 className="text-sm font-semibold">ডেলিভারি তথ্য</h3>

      <div>
        <label className="text-xs font-medium text-muted-foreground">আপনার নাম *</label>
        <input type="text" name="name" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">ফোন নম্বর *</label>
        <input type="tel" name="phone" required placeholder="01XXXXXXXXX" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">ডেলিভারি ঠিকানা *</label>
        <textarea name="address" required rows={2} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">এলাকা *</label>
        <select name="zone" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="inside_dhaka">ঢাকার ভিতরে</option>
          <option value="outside_dhaka">ঢাকার বাইরে</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">নোট (ঐচ্ছিক)</label>
        <input type="text" name="notes" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Order summary */}
      <div className="p-3 rounded-md bg-muted/50 border border-border/50 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{productName} × {quantity}</span>
          <span>৳{(price * quantity).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>ডেলিভারি চার্জ</span>
          <span>চেকআউটে</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: brandColor, color: '#0A0A0A' }}
        >
          {submitting ? 'প্রসেসিং...' : 'কনফার্ম অর্ডার'}
        </button>
      </div>
    </form>
  )
}
