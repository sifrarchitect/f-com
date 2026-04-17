'use client'

import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log to an error monitoring service here
    console.error('Captured in Global Error Boundary:', error)
  }, [error])

  return (
    <div className="flex h-[100vh] w-full items-center justify-center p-8 bg-zinc-950 text-white">
      <div className="flex max-w-md flex-col items-center text-center gap-6 p-8 border border-red-900/50 bg-red-950/20 rounded-xl shadow-2xl">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Something went wrong</h2>
          <p className="text-sm text-zinc-400">
            {error.message || 'An unexpected error occurred while loading this page.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium text-sm rounded-md hover:bg-zinc-200 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
