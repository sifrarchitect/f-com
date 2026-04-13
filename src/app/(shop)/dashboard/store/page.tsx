import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT } from '@/lib/utils'
import type { Shop } from '@/types/database'
import { Store, Link as LinkIcon, Copy, Truck } from 'lucide-react'

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

      {/* Store Info */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Store className="h-4 w-4" /> Store Information
        </h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Store Name</label>
          <input type="text" defaultValue={shop.name} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea defaultValue={shop.description || ''} rows={3} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Contact Phone</label>
            <input type="text" defaultValue={shop.contact_phone || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
            <input type="text" defaultValue={shop.contact_whatsapp || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Brand Color</label>
          <div className="flex items-center gap-3 mt-1">
            <input type="color" defaultValue={shop.primary_color} className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent" />
            <input type="text" defaultValue={shop.primary_color} className="flex-1 h-10 px-3 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      {/* Delivery Fees */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Truck className="h-4 w-4" /> Delivery Fees
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Inside Dhaka (BDT)</label>
            <input type="number" defaultValue={shop.delivery_fee_inside_dhaka} min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Outside Dhaka (BDT)</label>
            <input type="number" defaultValue={shop.delivery_fee_outside_dhaka} min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      {/* Steadfast */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Steadfast Courier</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">API Key</label>
          <input type="password" defaultValue={shop.steadfast_api_key || ''} placeholder="Enter Steadfast API key" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Secret Key</label>
          <input type="password" defaultValue={shop.steadfast_secret_key || ''} placeholder="Enter Steadfast secret key" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <button className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
        Save Store Settings
      </button>
    </div>
  )
}
