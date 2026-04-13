import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Shop } from '@/types/database'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getShopBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('shops').select('*').eq('slug', slug).single()
  return data as Shop | null
}

export default async function StoreTerms({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) notFound()

  return (
    <div className="min-h-screen">
      <div className="border-b border-border px-4 py-3">
        <Link href={`/store/${shopSlug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {shop.name}
        </Link>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        {shop.custom_terms ? (
          <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{shop.custom_terms}</div>
        ) : (
          <div className="text-sm text-muted-foreground space-y-4">
            <p>By placing an order on {shop.name}, you agree to the following terms.</p>
            <p>All orders are confirmed via phone call. Delivery charges apply based on your location (Inside Dhaka / Outside Dhaka).</p>
            <p>Payment verification for bKash/Nagad is required before shipment. Provide the correct Transaction ID when prompted.</p>
            <p>Refunds and returns are handled on a case-by-case basis. Contact us directly for any issues.</p>
            <p>We reserve the right to cancel orders from blacklisted phone numbers.</p>
          </div>
        )}
      </div>
    </div>
  )
}
