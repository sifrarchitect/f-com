import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import type { Agency } from '@/types/database'
import { Palette, Globe } from 'lucide-react'
import BrandingForm from './BrandingForm'

async function getAgency(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('agencies').select('*').eq('id', agencyId).single()
  return data as Agency | null
}

export default async function BrandingPage() {
  const user = await getUser()
  if (!user?.agencyId) return null

  const agency = await getAgency(user.agencyId)
  if (!agency) return null

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your agency&apos;s look and feel</p>
      </div>

      <BrandingForm agency={agency} />
    </div>
  )
}
