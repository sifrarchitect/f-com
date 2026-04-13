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

export default async function StorePrivacy({ params }: { params: Promise<{ shopSlug: string }> }) {
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
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        {shop.custom_privacy_policy ? (
          <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{shop.custom_privacy_policy}</div>
        ) : (
          <div className="text-sm text-muted-foreground space-y-4">
            <p>{shop.name} respects your privacy. We collect only the information needed to process your order: name, phone number, and delivery address.</p>
            <p>We do not share your personal information with third parties beyond what is necessary for order fulfillment (courier service for delivery).</p>
            <p>Payment information is verified through secure channels. We do not store your bKash/Nagad PIN or password.</p>
            <p>For questions, contact us at {shop.contact_phone || 'the number on our store page'}.</p>
          </div>
        )}
      </div>
    </div>
  )
}
