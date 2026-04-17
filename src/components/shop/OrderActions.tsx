'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendToSteadfast, cancelOrder } from '@/lib/actions/orders'
import { addToBlacklist } from '@/lib/actions/blacklist'
import { Truck, Ban, X, Loader2, Printer } from 'lucide-react'

// ── Send to Steadfast Button ───────────────────────────────────────
export function SteadfastButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  async function handleSend() {
    setLoading(true)
    const res = await sendToSteadfast(orderId)
    if (res.error) {
      setResult(`Error: ${res.error}`)
    } else {
      setResult(`Tracking: ${res.data?.tracking_code}`)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
        Send to Steadfast
      </button>
      {result && <p className="text-xs mt-1 text-muted-foreground">{result}</p>}
    </div>
  )
}

// ── Cancel Order Button + Modal ────────────────────────────────────
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCancel() {
    if (!reason.trim()) { setError('Please provide a reason'); return }
    setLoading(true)
    const res = await cancelOrder(orderId, reason)
    if (res.error) { setError(res.error); setLoading(false); return }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors"
      >
        Cancel Order
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-background border border-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Cancel Order</h3>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Reason *</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select reason…</option>
            <option value="Customer requested">Customer requested</option>
            <option value="Out of stock">Out of stock</option>
            <option value="Fraudulent order">Fraudulent order</option>
            <option value="Payment issue">Payment issue</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
          <button onClick={handleCancel} disabled={loading} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Blacklist Customer Button + Modal ──────────────────────────────
export function BlacklistButton({ phone, customerName }: { phone: string; customerName: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('fake_order')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBlacklist() {
    setLoading(true)
    const fd = new FormData()
    fd.set('phone', phone)
    fd.set('reason', reason)
    fd.set('notes', notes)
    const res = await addToBlacklist(fd)
    if (res.error) { setError(res.error); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 rounded-md">
        <Ban className="h-3.5 w-3.5" /> Blacklisted
      </span>
    )
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors">
        <Ban className="h-3.5 w-3.5" /> Blacklist Customer
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-background border border-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Blacklist Customer</h3>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-sm text-muted-foreground">Block <strong>{customerName}</strong> ({phone}) from placing future orders.</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Reason</label>
          <select value={reason} onChange={e => setReason(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="fake_order">Fake Order</option>
            <option value="fraud">Fraud</option>
            <option value="abusive">Abusive</option>
            <option value="chargeback">Chargeback</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
          <button onClick={handleBlacklist} disabled={loading} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Blacklist
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Print Slip Button ──────────────────────────────────────────────
export function PrintSlipButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors"
    >
      <Printer className="h-3.5 w-3.5" /> Print Slip
    </button>
  )
}
