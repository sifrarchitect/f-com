import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import type { Shop } from '@/types/database'
import { Link as LinkIcon, Copy } from 'lucide-react'
import StoreSettingsForm from '@/components/shop/StoreSettingsForm'

async function getShop(shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('shops').select('*').eq('id', shopId).single()
  return data as Shop | null
}

export default async function StoreSettingsPage() {
  const user = await getUser()
  if (!user?.shopId) return null
  const shop = await getShop(user.shopId)
  if (!shop) return null

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your storefront and delivery</p>
      </div>

      {/* Store URL */}
      <div className="fm-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LinkIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Store URL</h2>
            <p className="text-xs text-muted-foreground">Share this with your customers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`${process.env.NEXT_PUBLIC_APP_URL || ''}/store/${shop.slug}`}
            className="flex-1 h-10 px-3 rounded-md bg-muted border border-border text-sm font-mono text-muted-foreground"
          />
          <button className="h-10 w-10 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <StoreSettingsForm shop={shop} />
    </div>
  )
}
