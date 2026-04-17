'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createAgency } from '@/lib/actions/agencies'
import { useRouter } from 'next/navigation'

export default function AddAgencyButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createAgency(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Agency
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-semibold">Create Agency</h2>
                <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-accent transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Agency Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="My Agency"
                    className="w-full h-10 px-3 mt-1.5 rounded-md bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Slug *
                  </label>
                  <input
                    name="slug"
                    type="text"
                    required
                    placeholder="my-agency"
                    pattern="[a-z0-9\-]+"
                    title="Only lowercase letters, numbers and hyphens"
                    className="w-full h-10 px-3 mt-1.5 rounded-md bg-secondary/50 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">Used in URLs. Only lowercase, numbers, hyphens.</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Owner Email *
                  </label>
                  <input
                    name="owner_email"
                    type="email"
                    required
                    placeholder="owner@agency.com"
                    className="w-full h-10 px-3 mt-1.5 rounded-md bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      name="primary_color"
                      type="color"
                      defaultValue="#FFFFFF"
                      className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-muted-foreground">Pick the agency brand color</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Agency'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
