import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/auth'
import type { UserAppMetadata } from '@/types/database'

/**
 * Auth callback for email confirmation / magic link flows.
 * Exchanges the code for a session and redirects based on role.
 * New users with no role land on /welcome (pending setup).
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
      const role = appMetadata.role || null

      // If user has a role, go to their dashboard
      if (role) {
        const destination = getRoleDashboard(role)
        return NextResponse.redirect(new URL(destination, request.url))
      }

      // New user — no role yet, send to welcome page
      return NextResponse.redirect(new URL('/welcome', request.url))
    }
  }

  // Fallback
  return NextResponse.redirect(new URL(next, request.url))
}
