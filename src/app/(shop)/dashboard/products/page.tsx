import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT } from '@/lib/utils'
import type { Product } from '@/types/database'
import Link from 'next/link'
import { Package, Plus, Image } from 'lucide-react'

async function getProducts(shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .order('sort_order', { ascending: true })
  return (data || []) as Product[]
}

export default async function ProductsPage() {
  const user = await getUser()
  if (!user?.shopId) return null
  const products = await getProducts(user.shopId)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="fm-card p-16 text-center">
          <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No products yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Add your first product to start selling</p>
          <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}/edit`}
              className="fm-card overflow-hidden group hover:border-border/80 transition-all"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground/30" />
                )}
                {!product.is_active && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded fm-badge-destructive">Inactive</div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold">{formatBDT(product.base_price)}</span>
                  <span className={`text-xs ${product.simple_stock < 5 ? 'text-fm-destructive font-medium' : 'text-muted-foreground'}`}>
                    Stock: {product.simple_stock}
                  </span>
                </div>
                {product.has_variants && (
                  <span className="inline-flex mt-2 px-2 py-0.5 text-xs font-medium fm-badge-neutral">Has variants</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
