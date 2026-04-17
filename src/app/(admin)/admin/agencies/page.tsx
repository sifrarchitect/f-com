import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Agency } from '@/types/database'
import Link from 'next/link'
import { Building2, Plus, Search } from 'lucide-react'
import AgencyActions from './AgencyActions'
import AddAgencyButton from './AddAgencyButton'

async function getAgencies() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })
  return (data || []) as Agency[]
}

export default async function AgenciesPage() {
  const agencies = await getAgencies()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agencies</h1>
          <p className="text-sm text-muted-foreground mt-1">{agencies.length} total agencies</p>
        </div>
        <AddAgencyButton />
      </div>

      {/* Table */}
      <div className="fm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agency</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Building2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No agencies yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Create your first agency to get started</p>
                  </td>
                </tr>
              ) : (
                agencies.map((agency) => (
                  <tr key={agency.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3">
                      <Link href={`/admin/agencies/${agency.id}`} className="flex items-center gap-3 hover:underline">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: agency.primary_color + '20', color: agency.primary_color }}>
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">{agency.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{agency.slug}</td>
                    <td className="px-5 py-3 text-muted-foreground">{agency.owner_email}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(agency.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${agency.is_active ? 'fm-badge-success' : 'fm-badge-destructive'}`}>
                        {agency.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <AgencyActions agencyId={agency.id} isActive={agency.is_active} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
