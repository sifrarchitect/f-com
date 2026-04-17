import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 bg-zinc-950 min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-400 animate-pulse">Loading store data...</p>
      </div>
    </div>
  )
}
