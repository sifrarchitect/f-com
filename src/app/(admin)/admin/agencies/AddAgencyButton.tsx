'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Copy, Check } from 'lucide-react'
import { createAgency } from '@/lib/actions/agencies'
import { useRouter } from 'next/navigation'

export default function AddAgencyButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const email = formData.get('owner_email') as string

    const result = await createAgency(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      setCreated({ email, password })
      router.refresh()
    }
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-semibold">{created ? 'Agency Created' : 'Create Agency'}</h2>
                <button onClick={handleClose} className="p-1 rounded-md hover:bg-accent transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Success State */}
              {created ? (
                <div className="p-5 space-y-4">
                  <div className="p-4 rounded-lg bg-fm-success/10 border border-fm-success/20">
                    <p className="text-sm font-medium text-fm-success mb-3">Agency created successfully!</p>
                    <p className="text-xs text-muted-foreground mb-2">Share these login credentials with the agency owner:</p>
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
                /* Form */
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
                      Password *
                    </label>
                    <input
                      name="password"
                      type="text"
                      required
                      minLength={6}
                      placeholder="Set a password for the owner"
                      className="w-full h-10 px-3 mt-1.5 rounded-md bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                    <p className="text-xs text-muted-foreground/60 mt-1">The agency owner will use this to log in. Min 6 characters.</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
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
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
