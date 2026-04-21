'use client'

import { useRouter } from 'next/navigation'
import { toggleAgency, deleteAgency } from '@/lib/actions/agencies'
import { MoreHorizontal, Power, ExternalLink, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface AgencyActionsProps {
  agencyId: string
  isActive: boolean
}

export default function AgencyActions({ agencyId, isActive }: AgencyActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState<'toggle' | 'delete' | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  // Fixed positioning so dropdown escapes overflow:hidden table parents
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      })
    }
  }, [open])

  const handleToggle = async () => {
    setLoading('toggle')
    const result = await toggleAgency(agencyId, !isActive)
    setLoading(null)
    setOpen(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(isActive ? 'Agency suspended' : 'Agency activated')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    setLoading('delete')
    const result = await deleteAgency(agencyId)
    setLoading(null)
    setConfirmDelete(false)
    setOpen(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Agency deleted successfully')
      router.refresh()
    }
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={btnRef}
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="fixed z-50 w-48 rounded-md border border-border bg-popover shadow-xl overflow-hidden"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                onClick={() => { router.push(`/admin/agencies/${agencyId}`); setOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Details
              </button>

              <button
                onClick={handleToggle}
                disabled={loading !== null}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 ${
                  isActive ? 'text-yellow-500' : 'text-green-500'
                }`}
              >
                {loading === 'toggle'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Power className="h-3.5 w-3.5" />
                }
                {loading === 'toggle' ? 'Processing...' : isActive ? 'Suspend' : 'Activate'}
              </button>

              <div className="h-px bg-border" />

              <button
                onClick={() => { setOpen(false); setConfirmDelete(true) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Agency
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setConfirmDelete(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Delete Agency</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                All shops, products, and data associated with this agency will be permanently removed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={loading !== null}
                  className="flex-1 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading !== null}
                  className="flex-1 py-2 text-sm font-semibold bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === 'delete'
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Deleting...</>
                    : 'Yes, Delete'
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
