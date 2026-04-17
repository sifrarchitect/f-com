'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { suspendAllAgencies } from '@/lib/actions/store-settings'
import { AlertTriangle, Loader2 } from 'lucide-react'

export default function DoomsdayButton() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSuspend() {
    if (confirmText !== 'SUSPEND ALL') return
    setLoading(true)
    await suspendAllAgencies()
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="fm-card border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Immediately suspend all agencies and their shops. This will make all storefronts unavailable.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Suspend All Agencies
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-background border border-destructive/30 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h3 className="font-bold text-destructive">Confirm Global Suspension</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This will <strong>immediately disable all agencies</strong> and all their shops. All storefronts will go offline.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Type <span className="font-mono font-bold text-destructive">SUSPEND ALL</span> to confirm
              </label>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-destructive/30 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-destructive"
                placeholder="SUSPEND ALL"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setOpen(false); setConfirmText('') }} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={confirmText !== 'SUSPEND ALL' || loading}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Suspend All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
