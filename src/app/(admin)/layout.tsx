export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth guard will be added in Session 3
  return <>{children}</>
}
