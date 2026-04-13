'use client'

import { useRouter } from 'next/navigation'
import { toggleShop } from '@/lib/actions/shops'
import { MoreHorizontal, Power, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ShopActionsProps {
  shopId: string
  isActive: boolean
}

export default function ShopActions({ shopId, isActive }: ShopActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleShop(shopId, !isActive)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-md hover:bg-accent transition-colors">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 z-50 rounded-md border border-border bg-popover shadow-xl overflow-hidden">
            <button
              onClick={() => { router.push(`/agency/shops/${shopId}`); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Details
            </button>
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors ${
                isActive ? 'text-destructive' : 'text-fm-success'
              } disabled:opacity-50`}
            >
              <Power className="h-3.5 w-3.5" />
              {loading ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
