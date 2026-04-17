'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStoreSettings } from '@/lib/actions/store-settings'
import { Loader2, Save } from 'lucide-react'
import type { Shop } from '@/types/database'

export default function StoreSettingsForm({ shop }: { shop: Shop }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const fd = new FormData(e.currentTarget)
    const res = await updateStoreSettings(fd)
    if (res.error) { setError(res.error); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600">Settings saved!</div>
      )}

      {/* Store Info */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Store Information</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Store Name</label>
          <input name="name" defaultValue={shop.name} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea name="description" defaultValue={shop.description || ''} rows={3} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Contact Phone</label>
            <input name="contact_phone" defaultValue={shop.contact_phone || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
            <input name="contact_whatsapp" defaultValue={shop.contact_whatsapp || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Brand Color</label>
          <div className="flex items-center gap-3 mt-1">
            <input type="color" name="primary_color" defaultValue={shop.primary_color} className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent" />
            <span className="text-sm font-mono text-muted-foreground">{shop.primary_color}</span>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Delivery Fees</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Inside Dhaka (BDT)</label>
            <input type="number" name="delivery_fee_inside_dhaka" defaultValue={shop.delivery_fee_inside_dhaka} min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Outside Dhaka (BDT)</label>
            <input type="number" name="delivery_fee_outside_dhaka" defaultValue={shop.delivery_fee_outside_dhaka} min={0} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Payment Methods</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">bKash Number</label>
          <input name="bkash_merchant_number" defaultValue={shop.bkash_merchant_number || ''} placeholder="01XXXXXXXXX" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nagad Number</label>
          <input name="nagad_merchant_number" defaultValue={shop.nagad_merchant_number || ''} placeholder="01XXXXXXXXX" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Rocket Number</label>
          <input name="rocket_merchant_number" defaultValue={shop.rocket_merchant_number || ''} placeholder="01XXXXXXXXX" className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {/* Courier */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Steadfast Courier</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">API Key</label>
          <input type="password" name="steadfast_api_key" defaultValue={shop.steadfast_api_key || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Secret Key</label>
          <input type="password" name="steadfast_secret_key" defaultValue={shop.steadfast_secret_key || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {/* SEO */}
      <div className="fm-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">SEO</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
          <input name="seo_title" defaultValue={shop.seo_title || ''} className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
          <textarea name="seo_description" defaultValue={shop.seo_description || ''} rows={2} className="w-full px-3 py-2 mt-1 rounded-md bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Store Settings
      </button>
    </form>
  )
}
