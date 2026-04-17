'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPlan, updatePlan, deletePlan, togglePlan } from '@/lib/actions/store-settings'
import { Plus, X, Loader2, Edit3, Trash2, Power } from 'lucide-react'
import type { AgencyPlan } from '@/types/database'

export function CreatePlanButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featureInput, setFeatureInput] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('features', JSON.stringify(features))
    const res = await createPlan(fd)
    if (res.error) { setError(res.error); setLoading(false); return }
    setOpen(false)
    setLoading(false)
    setFeatures([])
    router.refresh()
  }

  function addFeature() {
    if (!featureInput.trim()) return
    setFeatures(prev => [...prev, featureInput.trim()])
    setFeatureInput('')
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4" /> Create Plan
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-background border border-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Create Plan</h3>
          <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Plan Name *</label>
          <input name="name" required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Starter" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Price (BDT/month) *</label>
          <input name="price" type="number" required min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" placeholder="500" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Features</label>
          <div className="flex gap-2 mt-1">
            <input
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className="flex-1 h-10 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 50 products"
            />
            <button type="button" onClick={addFeature} className="h-10 px-3 border border-border rounded-md hover:bg-accent transition-colors text-sm">Add</button>
          </div>
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                  {f}
                  <button type="button" onClick={() => setFeatures(prev => prev.filter((_, j) => j !== i))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create
          </button>
        </div>
      </form>
    </div>
  )
}

export function PlanActions({ plan }: { plan: AgencyPlan }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    await togglePlan(plan.id, !plan.is_active)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete plan "${plan.name}"?`)) return
    setLoading(true)
    await deletePlan(plan.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleToggle} disabled={loading}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
          plan.is_active ? 'border border-border hover:bg-accent' : 'text-green-600 border border-green-500/20 hover:bg-green-500/10'
        }`}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
        {plan.is_active ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={handleDelete} disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50">
        <Trash2 className="h-3 w-3" /> Delete
      </button>
    </div>
  )
}
