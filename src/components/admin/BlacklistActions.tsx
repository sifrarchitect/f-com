'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addToBlacklist, removeFromBlacklist } from '@/lib/actions/blacklist'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'

export function AddBlacklistButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const res = await addToBlacklist(fd)
    if (res.error) { setError(res.error); setLoading(false); return }
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> Add Number
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-background border border-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add to Blacklist</h3>
          <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Phone Number *</label>
          <input name="phone" required placeholder="01XXXXXXXXX" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Reason *</label>
          <select name="reason" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="fake_order">Fake Order</option>
            <option value="fraud">Fraud</option>
            <option value="abusive">Abusive</option>
            <option value="chargeback">Chargeback</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
          <input name="notes" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Block Number
          </button>
        </div>
      </form>
    </div>
  )
}

export function RemoveBlacklistButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle() {
    setLoading(true)
    await removeFromBlacklist(id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handle} disabled={loading} className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
    </button>
  )
}
