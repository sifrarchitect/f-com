'use client'

import { useState } from 'react'
import { Save, Check } from 'lucide-react'
import { updateCmsContent } from '@/lib/actions/cms'
import type { CmsContent } from '@/types/database'

interface CmsEditorProps {
  content: CmsContent[]
}

export default function CmsEditor({ content }: CmsEditorProps) {
  const [items, setItems] = useState(content)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  if (items.length === 0) return null

  const handleSave = async (id: string, key: string, value: string) => {
    setSaving(id)
    await updateCmsContent(id, value)
    setSaving(null)
    setSaved(id)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleChange = (id: string, value: string) => {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, value } : item
    ))
  }

  // Group by prefix
  const grouped: Record<string, typeof items> = {}
  for (const item of items) {
    const prefix = item.key.split('_')[0] || 'other'
    if (!grouped[prefix]) grouped[prefix] = []
    grouped[prefix].push(item)
  }

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    social: 'Social Proof',
    feature: 'Features',
    cta: 'Call to Action',
    pricing: 'Pricing',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact Info',
    footer: 'Footer',
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([prefix, entries]) => (
        <div key={prefix} className="fm-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">
              {sectionLabels[prefix] || prefix.charAt(0).toUpperCase() + prefix.slice(1)}
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {entries.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground font-mono">
                    {item.key}
                  </label>
                  <button
                    onClick={() => handleSave(item.id, item.key, item.value)}
                    disabled={saving === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {saved === item.id ? (
                      <><Check className="h-3 w-3 text-fm-success" /> Saved</>
                    ) : saving === item.id ? (
                      'Saving...'
                    ) : (
                      <><Save className="h-3 w-3" /> Save</>
                    )}
                  </button>
                </div>
                {item.value.length > 100 ? (
                  <textarea
                    value={item.value}
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
