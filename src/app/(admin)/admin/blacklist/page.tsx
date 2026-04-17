import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { CustomerBlacklist } from '@/types/database'
import { Ban, Download } from 'lucide-react'
import { AddBlacklistButton, RemoveBlacklistButton } from '@/components/admin/BlacklistActions'

async function getBlacklist() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('customer_blacklist')
    .select('*')
    .order('created_at', { ascending: false })
  return (data || []) as CustomerBlacklist[]
}

export default async function BlacklistPage() {
  const entries = await getBlacklist()
  const activeCount = entries.filter((e) => e.is_active).length

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Blacklist</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeCount} active blocks · {entries.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <AddBlacklistButton />
        </div>
      </div>

      <div className="fm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Added</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Ban className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No blacklisted numbers</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Blocked customer phone numbers will appear here</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3 font-mono text-xs font-medium">{entry.phone}</td>
                    <td className="px-5 py-3">{entry.reason}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{entry.notes || '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(entry.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${entry.is_active ? 'fm-badge-destructive' : 'fm-badge-neutral'}`}>
                        {entry.is_active ? 'Blocked' : 'Removed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {entry.is_active && <RemoveBlacklistButton id={entry.id} />}
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
