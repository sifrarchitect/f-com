'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createShop, toggleShop } from '@/lib/actions/shops'
import { Plus, X, Loader2, Power } from 'lucide-react'
import type { AgencyPlan } from '@/types/database'

export function AddShopButton({ plans }: { plans: AgencyPlan[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    // Auto-generate slug from name
    const name = fd.get('name') as string
    if (!fd.get('slug')) {
      fd.set('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50))
    }
    const res = await createShop(fd)
    if (res.error) { setError(res.error); setLoading(false); return }
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> Add Shop
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-background border border-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add New Shop</h3>
          <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Shop Name *</label>
          <input name="name" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="My Shop" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">URL Slug</label>
          <input name="slug" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" placeholder="auto-generated" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Owner Email *</label>
          <input name="owner_email" type="email" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="owner@example.com" />
        </div>
        {plans.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Plan</label>
            <select name="plan_id" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">No plan</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.price} BDT/mo</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
          <input name="description" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create Shop
          </button>
        </div>
      </form>
    </div>
  )
}

export function ToggleShopButton({ shopId, isActive }: { shopId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle() {
    if (!confirm(`${isActive ? 'Disable' : 'Enable'} this shop?`)) return
    setLoading(true)
    await toggleShop(shopId, !isActive)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
        isActive
          ? 'text-destructive border border-destructive/20 hover:bg-destructive/10'
          : 'text-green-600 border border-green-500/20 hover:bg-green-500/10'
      }`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
      {isActive ? 'Disable' : 'Enable'}
    </button>
  )
}
