import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/auth'
import type { UserAppMetadata } from '@/types/database'

/**
 * Auth callback for email confirmation / magic link flows.
 * Exchanges the code for a session and redirects based on role.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const appMetadata = (data.user.app_metadata || {}) as UserAppMetadata
      const destination = getRoleDashboard(appMetadata.role || null)
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
