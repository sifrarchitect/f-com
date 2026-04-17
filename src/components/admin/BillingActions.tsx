'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markInvoicePaid } from '@/lib/actions/billing'
import { Check, Loader2 } from 'lucide-react'

export function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle() {
    setLoading(true)
    const res = await markInvoicePaid(invoiceId)
    if (!res.error) router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      Mark Paid
    </button>
  )
}
