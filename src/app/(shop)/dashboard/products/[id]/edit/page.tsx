import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Product } from '@/types/database'
import ProductForm from '@/components/shop/ProductForm'

async function getProduct(id: string, shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
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

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
      </div>

      <ProductForm product={product} shopId={user.shopId} />
    </div>
  )
}
