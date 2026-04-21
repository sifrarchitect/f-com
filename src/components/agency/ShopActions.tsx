'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createShop, toggleShop } from '@/lib/actions/shops'
import { Plus, X, Loader2, Power, Copy, Check } from 'lucide-react'
import type { AgencyPlan } from '@/types/database'

export function AddShopButton({ plans }: { plans: AgencyPlan[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = fd.get('owner_email') as string
    const password = fd.get('password') as string
    // Auto-generate slug from name
    const name = fd.get('name') as string
    if (!fd.get('slug')) {
      fd.set('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50))
    }
    const res = await createShop(fd)
    if (res.error) { setError(res.error); setLoading(false); return }
    setLoading(false)
    setCreated({ email, password })
    router.refresh()
  }

  function handleCopy() {
    if (!created) return
    navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setOpen(false)
    setCreated(null)
    setError(null)
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
      <div className="w-full max-w-md bg-background border border-border rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold">{created ? 'Shop Created' : 'Add New Shop'}</h3>
          <button type="button" onClick={handleClose} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>

        {created ? (
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-lg bg-fm-success/10 border border-fm-success/20">
              <p className="text-sm font-medium text-fm-success mb-3">Shop created successfully!</p>
              <p className="text-xs text-muted-foreground mb-2">Share these login credentials with the shop owner:</p>
              <div className="space-y-2 bg-background/50 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm font-mono">{created.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Password</span>
                  <span className="text-sm font-mono">{created.password}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-fm-success" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && <p className="text-sm text-destructive p-3 rounded-lg bg-destructive/10 border border-destructive/20">{error}</p>}
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
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password *</label>
              <input name="password" type="text" required minLength={6} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Set a password for the owner" />
              <p className="text-xs text-muted-foreground/60 mt-1">The shop owner will use this to log in. Min 6 characters.</p>
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
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create Shop
              </button>
            </div>
          </form>
        )}
      </div>
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
