'use client'

import { useRouter } from 'next/navigation'
import { toggleAgency, deleteAgency } from '@/lib/actions/agencies'
import { MoreHorizontal, Power, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface AgencyActionsProps {
  agencyId: string
  isActive: boolean
}

export default function AgencyActions({ agencyId, isActive }: AgencyActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<'toggle' | 'delete' | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  // Calculate fixed position so dropdown is never clipped by overflow:hidden parents
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
    await toggleAgency(agencyId, !isActive)
    setLoading(null)
    setOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this agency? This action cannot be undone.')) return
    setLoading('delete')
    await deleteAgency(agencyId)
    setLoading(null)
    setOpen(false)
    router.refresh()
  }

  return (
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
          {/* Full-screen backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Menu rendered at fixed position to escape overflow clipping */}
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
                isActive ? 'text-yellow-600' : 'text-fm-success'
              }`}
            >
              {loading === 'toggle'
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Power className="h-3.5 w-3.5" />
              }
              {loading === 'toggle' ? 'Processing...' : isActive ? 'Suspend Agency' : 'Activate Agency'}
            </button>

            <div className="h-px bg-border" />

            <button
              onClick={handleDelete}
              disabled={loading !== null}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {loading === 'delete'
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />
              }
              {loading === 'delete' ? 'Deleting...' : 'Delete Agency'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
