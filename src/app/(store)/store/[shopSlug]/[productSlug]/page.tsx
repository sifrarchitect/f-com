import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Shop, Product, VariantType, DiscountTimer } from '@/types/database'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Truck, Shield } from 'lucide-react'
import CheckoutButton from './CheckoutButton'
import DiscountBanner from '@/components/store/DiscountBanner'

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

async function getActiveTimer(shopId: string, productId: string): Promise<DiscountTimer | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('discount_timers')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .or(`product_id.eq.${productId},product_id.is.null`)
    .order('product_id', { ascending: false, nullsFirst: false })
    .limit(1)
    .single()
  return data as DiscountTimer | null
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
    openGraph: {
      title: product.seo_title || `${product.name} — ${shop.name}`,
      description: product.seo_description || product.description || '',
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ shopSlug: string; productSlug: string }> }) {
  const { shopSlug, productSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) notFound()

  const product = await getProductBySlug(shop.id, productSlug)
  if (!product) notFound()

  const timer = await getActiveTimer(shop.id, product.id)
  const variants = (product.variants
    ? Array.isArray(product.variants)
      ? product.variants
      : JSON.parse(product.variants as string)
    : []) as unknown as VariantType[]

  const inStock = product.has_variants
    ? variants.some(v => v.options.some(o => o.stock > 0))
    : product.simple_stock > 0

  const discountedPrice = timer
    ? Math.round(product.base_price * (1 - timer.discount_percent / 100))
    : product.base_price

  return (
    <div className="min-h-screen">
      {/* Discount Banner */}
      {timer && <DiscountBanner timer={timer} brandColor={shop.primary_color} />}

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
            <div className="aspect-square rounded-xl bg-muted overflow-hidden border border-border">
              {product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                  <span className="text-6xl">📦</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden border border-border">
                    <img src={img} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info + Checkout */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-bold" style={{ color: shop.primary_color }}>
                  BDT {discountedPrice.toLocaleString()}
                </span>
                {timer && (
                  <span className="text-base text-muted-foreground line-through">
                    BDT {product.base_price.toLocaleString()}
                  </span>
                )}
                {timer && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: shop.primary_color }}>
                    {timer.discount_percent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Stock */}
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                In Stock
                {!product.has_variants && product.simple_stock < 10 && ` (Only ${product.simple_stock} left)`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                Out of Stock
              </span>
            )}

            {/* Description */}
            {product.description && (
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            )}

            {/* Delivery info */}
            <div className="space-y-2 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Inside Dhaka: <strong>BDT {shop.delivery_fee_inside_dhaka}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Outside Dhaka: <strong>BDT {shop.delivery_fee_outside_dhaka}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Payment via bKash / Nagad / Rocket</span>
              </div>
            </div>

            {/* Checkout Button */}
            <CheckoutButton
              shopSlug={shopSlug}
              productId={product.id}
              productName={product.name}
              basePrice={product.base_price}
              inStock={inStock}
              brandColor={shop.primary_color}
              hasVariants={product.has_variants}
              variants={variants}
              simpleStock={product.simple_stock}
              bkashNumber={shop.bkash_merchant_number}
              nagadNumber={shop.nagad_merchant_number}
              rocketNumber={shop.rocket_merchant_number}
              deliveryFeeInside={shop.delivery_fee_inside_dhaka}
              deliveryFeeOutside={shop.delivery_fee_outside_dhaka}
              activeDiscountPercent={timer?.discount_percent ?? null}
              shopId={shop.id}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground mt-8">
        <p>© {new Date().getFullYear()} {shop.name} · Powered by F-Manager</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href={`/store/${shopSlug}/privacy`} className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href={`/store/${shopSlug}/terms`} className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
