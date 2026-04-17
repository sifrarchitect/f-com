import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { formatBDT } from '@/lib/utils'
import type { AgencyPlan } from '@/types/database'
import { Sparkles, Check } from 'lucide-react'
import { CreatePlanButton, PlanActions } from '@/components/agency/PlanActions'

async function getPlans(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agency_plans')
    .select('*')
    .eq('agency_id', agencyId)
    .order('price', { ascending: true })
  return (data || []) as AgencyPlan[]
}

export default async function PlansPage() {
  const user = await getUser()
  if (!user?.agencyId) return null

  const plans = await getPlans(user.agencyId)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Set pricing for your sellers</p>
        </div>
        <CreatePlanButton />
      </div>

      {plans.length === 0 ? (
        <div className="fm-card p-16 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No plans yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Create your first plan to assign to sellers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="fm-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${plan.is_active ? 'fm-badge-success' : 'fm-badge-neutral'}`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">{formatBDT(plan.price)}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              {plan.features.length > 0 && (
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-fm-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <PlanActions plan={plan} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
