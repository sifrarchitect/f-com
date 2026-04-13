export default function StoreHomePage({ params }: { params: Promise<{ shopSlug: string }> }) {
  return (
    <div className="min-h-screen bg-background p-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Store Home</h1>
      <p className="text-muted-foreground">Product grid + checkout — Session 8</p>
    </div>
  )
}
