export const dynamic = 'force-dynamic'

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth guard + sidebar will be added in Session 3
  return <>{children}</>
}
