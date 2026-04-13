import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT } from '@/lib/utils'
import type { Product } from '@/types/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getProduct(productId: string, shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('shop_id', shopId)
    .single()
  return data as Product | null
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser()
  if (!user?.shopId) return null

  const product = await getProduct(id, user.shopId)
  if (!product) notFound()

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
        </div>
        <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${product.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <form className="space-y-6">
        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Basic Information</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Product Name *</label>
            <input type="text" name="name" defaultValue={product.name} required className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <input type="text" name="slug" defaultValue={product.slug} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea name="description" rows={4} defaultValue={product.description || ''} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y" />
          </div>
        </div>

        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Price (BDT) *</label>
              <input type="number" name="base_price" defaultValue={product.base_price} required min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stock</label>
              <input type="number" name="simple_stock" defaultValue={product.simple_stock} min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="rounded border-border" id="is_active" />
            <label htmlFor="is_active" className="text-sm">Product is active and visible in store</label>
          </div>
        </div>

        <div className="fm-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">SEO</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
            <input type="text" name="seo_title" defaultValue={product.seo_title || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
            <textarea name="seo_description" rows={2} defaultValue={product.seo_description || ''} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
          <button type="button" className="px-6 py-2.5 text-sm font-medium text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors">
            Delete Product
          </button>
        </div>
      </form>
    </div>
  )
}
