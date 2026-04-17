import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getUser } from '@/lib/auth'
import ProductForm from '@/components/shop/ProductForm'

export default async function NewProductPage() {
  const user = await getUser()
  if (!user?.shopId) return null

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new product for your store</p>
      </div>

      <ProductForm shopId={user.shopId} />
    </div>
  )
}
