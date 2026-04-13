export default function AdminAgencyDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Agency Detail</h1>
      <p className="text-muted-foreground">Session 5</p>
    </div>
  )
}
