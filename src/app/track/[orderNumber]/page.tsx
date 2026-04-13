export default function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Order Tracking</h1>
        <p className="text-muted-foreground">Track your order — Session 8</p>
      </div>
    </div>
  )
}
