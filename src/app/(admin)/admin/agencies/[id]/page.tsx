import { createClient } from '@/lib/supabase/server'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Agency, Shop } from '@/types/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Building2, Store, ArrowLeft, Globe, Mail } from 'lucide-react'

async function getAgency(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single()
  return data as Agency | null
}

async function getAgencyShops(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shops')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  return (data || []) as Shop[]
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [agency, shops] = await Promise.all([
    getAgency(id),
    getAgencyShops(id),
  ])

  if (!agency) notFound()

  const activeShops = shops.filter((s) => s.is_active).length

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Back */}
      <Link href="/admin/agencies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Agencies
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: agency.primary_color + '20', color: agency.primary_color }}>
          <Building2 className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{agency.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground font-mono">{agency.slug}.fmanager.com</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${agency.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
              {agency.is_active ? 'Active' : 'Suspended'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shops</p>
          <p className="text-2xl font-bold mt-1">{shops.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{activeShops} active</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</p>
          <p className="text-sm font-medium mt-2 truncate">{agency.owner_name || '—'}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{agency.owner_email}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand Color</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: agency.primary_color }} />
            <span className="text-sm font-mono">{agency.primary_color}</span>
          </div>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</p>
          <p className="text-sm font-medium mt-2">{formatDate(agency.created_at)}</p>
          <p className="text-xs text-muted-foreground mt-1">Plan limit: {agency.plan_limit}</p>
        </div>
      </div>

      {/* Custom Domain */}
      {agency.custom_domain && (
        <div className="fm-card p-5 flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Custom Domain</p>
            <p className="text-xs text-muted-foreground">{agency.custom_domain}</p>
          </div>
        </div>
      )}

      {/* Shops Table */}
      <div className="fm-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-sm font-semibold">Shops ({shops.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Shop</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {shops.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-sm">No shops under this agency</td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{shop.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{shop.owner_email || '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(shop.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${shop.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
                        {shop.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {agency.notes && (
        <div className="fm-card p-5">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{agency.notes}</p>
        </div>
      )}
    </div>
  )
}
