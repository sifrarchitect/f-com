import { getUser } from '@/lib/auth'
import { Receipt, CreditCard } from 'lucide-react'

export default async function ShopBillingPage() {
  const user = await getUser()
  if (!user?.shopId) return null

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Your subscription and payment history</p>
      </div>

      {/* Current Plan */}
      <div className="fm-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Current Plan</h2>
            <p className="text-xs text-muted-foreground">Managed by your agency</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            Your billing is managed by your agency. Contact your agency administrator for plan details and payment information.
          </p>
        </div>
      </div>

      {/* Usage */}
      <div className="fm-card p-6">
        <h2 className="text-sm font-semibold mb-4">Platform Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <p className="text-lg font-bold mt-1 text-fm-success">Active</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan Type</p>
            <p className="text-lg font-bold mt-1">Agency Managed</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Support</p>
            <p className="text-lg font-bold mt-1">Via Agency</p>
          </div>
        </div>
      </div>

      {/* Empty invoice placeholder */}
      <div className="fm-card p-16 text-center">
        <Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No direct invoices</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Your agency handles all platform billing</p>
      </div>
    </div>
  )
}
