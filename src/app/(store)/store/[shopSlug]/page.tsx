import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Shop, Product } from '@/types/database'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Phone, MessageCircle } from 'lucide-react'

async function getShopBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('shops').select('*').eq('slug', slug).eq('is_active', true).single()
  return data as Shop | null
}

async function getProducts(shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  return (data || []) as Product[]
}

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const { shopSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) return { title: 'Store Not Found' }
  return {
    title: shop.seo_title || `${shop.name} — Shop`,
    description: shop.seo_description || shop.description || `Shop at ${shop.name}`,
  }
}

export default async function StoreHomePage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) notFound()

  const products = await getProducts(shop.id)

  return (
    <div className="min-h-screen" style={{ '--brand-color': shop.primary_color } as React.CSSProperties}>
      {/* Header / Banner */}
      <header className="relative">
        {shop.banner_visible && (
          <div
            className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${shop.primary_color}20, ${shop.primary_color}05)` }}
          >
            {shop.banner_url && (
              <img src={shop.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            )}
            <div className="relative z-10 text-center px-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{shop.banner_text_title || shop.name}</h1>
              {shop.banner_text_subtitle && (
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">{shop.banner_text_subtitle}</p>
              )}
            </div>
          </div>
        )}
        {!shop.banner_visible && (
          <div className="px-6 py-8 md:py-12 text-center border-b border-border">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{shop.name}</h1>
            {shop.description && <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">{shop.description}</p>}
          </div>
        )}

        {/* Contact bar */}
        {(shop.contact_phone || shop.contact_whatsapp) && (
          <div className="flex items-center justify-center gap-6 border-b border-border py-3 text-xs text-muted-foreground">
            {shop.contact_phone && (
              <a href={`tel:${shop.contact_phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Phone className="h-3.5 w-3.5" /> {shop.contact_phone}
              </a>
            )}
            {shop.contact_whatsapp && (
              <a href={`https://wa.me/${shop.contact_whatsapp}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
          </div>
        )}
      </header>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No products available</p>
            <p className="text-xs text-muted-foreground/60 mt-1">This store hasn&apos;t added any products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${shopSlug}/${product.slug}`}
                className="group rounded-lg border border-border/50 bg-card overflow-hidden hover:border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <p className="text-lg font-bold mt-1" style={{ color: shop.primary_color }}>
                    BDT {product.base_price.toLocaleString()}
                  </p>
                  {product.simple_stock < 5 && product.simple_stock > 0 && (
                    <p className="text-xs text-fm-warning mt-1">Only {product.simple_stock} left!</p>
                  )}
                  {product.simple_stock <= 0 && (
                    <p className="text-xs text-fm-destructive mt-1">Out of stock</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {shop.name}</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href={`/store/${shopSlug}/privacy`} className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href={`/store/${shopSlug}/terms`} className="hover:text-foreground transition-colors">Terms</Link>
        </div>
        <p className="mt-3 text-muted-foreground/40">Powered by F-Manager</p>
      </footer>
    </div>
  )
}
