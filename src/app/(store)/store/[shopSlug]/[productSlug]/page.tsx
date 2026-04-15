import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Shop, Product } from '@/types/database'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Truck, Shield, Phone } from 'lucide-react'
import CheckoutButton from './CheckoutButton'

async function getShopBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('shops').select('*').eq('slug', slug).eq('is_active', true).single()
  return data as Shop | null
}

async function getProductBySlug(shopId: string, productSlug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .eq('slug', productSlug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string; productSlug: string }> }): Promise<Metadata> {
  const { shopSlug, productSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) return { title: 'Not Found' }
  const product = await getProductBySlug(shop.id, productSlug)
  if (!product) return { title: 'Not Found' }
  return {
    title: product.seo_title || `${product.name} — ${shop.name}`,
    description: product.seo_description || product.description || `Buy ${product.name} from ${shop.name}`,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ shopSlug: string; productSlug: string }> }) {
  const { shopSlug, productSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) notFound()

  const product = await getProductBySlug(shop.id, productSlug)
  if (!product) notFound()

  const inStock = product.simple_stock > 0

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-border px-4 py-3">
        <Link href={`/store/${shopSlug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {shop.name}
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-lg bg-muted overflow-hidden border border-border">
              {product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="aspect-square rounded-md bg-muted overflow-hidden border border-border">
                    <img src={img} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-bold" style={{ color: shop.primary_color }}>
                  BDT {product.base_price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stock */}
            <div>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-fm-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-fm-success" /> In Stock
                  {product.simple_stock < 10 && ` (Only ${product.simple_stock} left)`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-fm-destructive">
                  <span className="w-1.5 h-1.5 rounded-full bg-fm-destructive" /> Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            )}

            {/* Delivery info */}
            <div className="space-y-2 p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Inside Dhaka: BDT {shop.delivery_fee_inside_dhaka}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Outside Dhaka: BDT {shop.delivery_fee_outside_dhaka}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Payment</span>
              </div>
            </div>

            {/* Buy button */}
            <CheckoutButton
              shopSlug={shopSlug}
              productId={product.id}
              productName={product.name}
              price={product.base_price}
              inStock={inStock}
              brandColor={shop.primary_color}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground mt-8">
        <p>© {new Date().getFullYear()} {shop.name} · Powered by F-Manager</p>
      </footer>
    </div>
  )
}
