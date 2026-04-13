export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background p-8 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded" />
        ))}
      </div>
    </div>
  )
}
