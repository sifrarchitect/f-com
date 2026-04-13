'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateAgency } from '@/lib/actions/agencies'
import { Save, Check, Palette, Globe } from 'lucide-react'
import type { Agency } from '@/types/database'

export default function BrandingForm({ agency }: { agency: Agency }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [color, setColor] = useState(agency.primary_color)
  const [customDomain, setCustomDomain] = useState(agency.custom_domain || '')

  const handleSave = async () => {
    setSaving(true)
    const formData = new FormData()
    formData.set('primary_color', color)
    formData.set('custom_domain', customDomain)
    await updateAgency(agency.id, formData)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Logo */}
      <div className="fm-card p-6">
        <h2 className="text-sm font-semibold mb-4">Agency Logo</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border border-border">
            {agency.logo_url ? (
              <img src={agency.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Palette className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <button className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors">
              Upload Logo
            </button>
            <p className="text-xs text-muted-foreground mt-1.5">PNG or SVG, max 2MB. 256×256px recommended.</p>
          </div>
        </div>
      </div>

      {/* Brand Color */}
      <div className="fm-card p-6">
        <h2 className="text-sm font-semibold mb-4">Brand Color</h2>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent"
          />
          <div className="flex-1">
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Used on your seller stores and agency panel.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {['#FFFFFF', '#FF3B3B', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent' }}
            />
          ))}
        </div>
      </div>

      {/* Custom Domain */}
      <div className="fm-card p-6">
        <h2 className="text-sm font-semibold mb-1">Custom Domain</h2>
        <p className="text-xs text-muted-foreground mb-4">Point your domain to F-Manager with a CNAME record</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Current URL</label>
            <p className="text-sm font-mono mt-1">{agency.slug}.fmanager.com</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Custom Domain (optional)</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="yourdomain.com"
              className="w-full h-10 px-3 mt-1 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {customDomain && (
            <div className="p-3 rounded-md bg-muted/50 border border-border">
              <p className="text-xs font-medium mb-2">DNS Configuration</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-muted-foreground">Type</span>
                <span className="text-muted-foreground">Name</span>
                <span className="text-muted-foreground">Value</span>
                <span className="font-mono">CNAME</span>
                <span className="font-mono">@</span>
                <span className="font-mono text-primary">{agency.slug}.fmanager.com</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
      </button>
    </div>
  )
}
