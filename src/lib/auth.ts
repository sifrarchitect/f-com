// =============================================
// F-Manager — Auth Utilities
// Server-side helpers for authentication + authorization
// =============================================

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole, UserAppMetadata } from '@/types/database'

/**
 * Get the current authenticated user with role info.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const appMetadata = (user.app_metadata || {}) as UserAppMetadata

  return {
    id: user.id,
    email: user.email || '',
    role: appMetadata.role || null,
    agencyId: appMetadata.agency_id || null,
    shopId: appMetadata.shop_id || null,
    metadata: appMetadata,
  }
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getUser>>>

/**
 * Require authentication. Redirects to /login if not authenticated.
 */
export async function requireAuth(redirectTo = '/login') {
  const user = await getUser()
  if (!user) redirect(redirectTo)
  return user
}

/**
 * Require a specific role. Redirects if user doesn't have the required role.
 */
export async function requireRole(requiredRole: UserRole, redirectTo = '/login') {
  const user = await requireAuth(redirectTo)
  if (user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const destination = getRoleDashboard(user.role)
    redirect(destination || '/login')
  }
  return user
}

/**
 * Get the dashboard URL for a given role.
 */
export function getRoleDashboard(role: UserRole | null): string {
  switch (role) {
    case 'super_admin':
      return '/admin'
    case 'agency_owner':
      return '/agency'
    case 'shop_owner':
      return '/dashboard'
    default:
      return '/login'
  }
}

/**
 * Check if user has one of the allowed roles.
 */
export function hasRole(user: AuthUser, roles: UserRole[]): boolean {
  return user.role !== null && roles.includes(user.role)
}
