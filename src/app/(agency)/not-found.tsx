import Link from 'next/link'

export default function AgencyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Back to dashboard</Link>
    </div>
  )
}
