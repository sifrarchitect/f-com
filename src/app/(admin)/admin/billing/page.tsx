import { createClient } from '@/lib/supabase/server'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Invoice, Agency } from '@/types/database'
import { Receipt, Check } from 'lucide-react'

async function getInvoicesWithAgencies() {
  const supabase = await createClient()

  const [invoicesRes, agenciesRes] = await Promise.all([
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('agencies').select('id, name'),
  ])

  const invoices = (invoicesRes.data || []) as Invoice[]
  const agencies = (agenciesRes.data || []) as Pick<Agency, 'id' | 'name'>[]
  const agencyMap = new Map(agencies.map((a) => [a.id, a.name]))

  return invoices.map((inv) => ({
    ...inv,
    agencyName: agencyMap.get(inv.agency_id) || 'Unknown',
  }))
}

export default async function BillingPage() {
  const invoices = await getInvoicesWithAgencies()

  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.amount_bdt, 0)
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount_bdt, 0)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform invoices — 100 BDT per active shop per month</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Invoices</p>
          <p className="text-2xl font-bold mt-1">{invoices.length}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unpaid</p>
          <p className="text-2xl font-bold mt-1 text-fm-warning">{formatBDT(totalUnpaid)}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collected</p>
          <p className="text-2xl font-bold mt-1 text-fm-success">{formatBDT(totalPaid)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="fm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agency</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Shops</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No invoices yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Invoices will be generated monthly by the cron job</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3 font-medium">{inv.agencyName}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(inv.year, inv.month - 1).toLocaleString('en', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{inv.active_shop_count}</td>
                    <td className="px-5 py-3 font-mono">{formatBDT(inv.amount_bdt)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${inv.status === 'paid' ? 'fm-badge-success' : 'fm-badge-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {inv.status === 'unpaid' && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors">
                          <Check className="h-3 w-3" />
                          Mark Paid
                        </button>
                      )}
                      {inv.status === 'paid' && inv.paid_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(inv.paid_at)}
                        </span>
                      )}
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
