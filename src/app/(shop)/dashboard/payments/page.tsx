import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import type { Shop } from '@/types/database'
import { Shield, Smartphone } from 'lucide-react'

async function getShop(shopId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('shops').select('*').eq('id', shopId).single()
  return data as Shop | null
}

export default async function PaymentsPage() {
  const user = await getUser()
  if (!user?.shopId) return null
  const shop = await getShop(user.shopId)
  if (!shop) return null

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure how customers pay you</p>
      </div>

      {/* bKash */}
      <div className="fm-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">bKash</h2>
            <p className="text-xs text-muted-foreground">Mobile payment (most popular in Bangladesh)</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">bKash Merchant Number</label>
          <input
            type="text"
            defaultValue={shop.bkash_merchant_number || ''}
            placeholder="01XXXXXXXXX"
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Nagad */}
      <div className="fm-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Nagad</h2>
            <p className="text-xs text-muted-foreground">Alternative mobile payment</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nagad Merchant Number</label>
          <input
            type="text"
            defaultValue={shop.nagad_merchant_number || ''}
            placeholder="01XXXXXXXXX"
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Rocket */}
      <div className="fm-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Rocket</h2>
            <p className="text-xs text-muted-foreground">Dutch-Bangla mobile banking</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Rocket Merchant Number</label>
          <input
            type="text"
            defaultValue={shop.rocket_merchant_number || ''}
            placeholder="01XXXXXXXXX"
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* RuxSpeed */}
      <div className="fm-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">RuxSpeed Auto-Verify</h2>
            <p className="text-xs text-muted-foreground">Automatic TrxID verification via webhook</p>
          </div>
          <span className={`ml-auto px-2.5 py-1 rounded text-xs font-medium ${shop.ruxspeed_enabled ? 'fm-badge-success' : 'fm-badge-neutral'}`}>
            {shop.ruxspeed_enabled ? 'ON' : 'OFF'}
          </span>
        </div>
        {shop.ruxspeed_enabled && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Webhook URL</label>
            <input
              type="text"
              readOnly
              value={`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/ruxspeed-webhook`}
              className="w-full h-10 px-3 mt-1 rounded-md bg-muted border border-border text-sm font-mono text-muted-foreground"
            />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Payment Secret Key</label>
          <input
            type="password"
            defaultValue={shop.payment_secret_key}
            className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">Used for HMAC webhook signature verification</p>
        </div>
      </div>

      <button className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
        Save Payment Settings
      </button>
    </div>
  )
}
