export default function ProductPage({ params }: { params: Promise<{ shopSlug: string; productSlug: string }> }) {
  return (
    <div className="min-h-screen bg-background p-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Product + Checkout</h1>
      <p className="text-muted-foreground">Full checkout — Session 8</p>
    </div>
  )
}
