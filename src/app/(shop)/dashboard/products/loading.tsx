export default function ShopProductsLoading() {
  return <div className="p-8 animate-pulse"><div className="h-8 w-32 bg-muted rounded mb-4" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded" />)}</div></div>
}
