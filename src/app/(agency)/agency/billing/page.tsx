import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/database'
import { Receipt } from 'lucide-react'

async function getInvoices(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  return (data || []) as Invoice[]
}

export default async function AgencyBillingPage() {
  const user = await getUser()
  if (!user?.agencyId) return null

  const invoices = await getInvoices(user.agencyId)
  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.amount_bdt, 0)
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount_bdt, 0)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Your platform fee invoices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold mt-1 text-fm-warning">{formatBDT(totalUnpaid)}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-bold mt-1 text-fm-success">{formatBDT(totalPaid)}</p>
        </div>
        <div className="fm-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate</p>
          <p className="text-2xl font-bold mt-1">৳১০০</p>
          <p className="text-xs text-muted-foreground mt-1">per active shop / month</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="fm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Shops</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No invoices yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Invoices are generated on the 1st of each month</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 fm-table-row">
                    <td className="px-5 py-3 font-medium">
                      {new Date(inv.year, inv.month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{inv.active_shop_count}</td>
                    <td className="px-5 py-3 font-mono">{formatBDT(inv.amount_bdt)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${inv.status === 'paid' ? 'fm-badge-success' : 'fm-badge-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(inv.created_at)}</td>
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
