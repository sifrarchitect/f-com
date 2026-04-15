'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/auth'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { UserAppMetadata } from '@/types/database'

// =============================================
// Login
// =============================================
export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const appMetadata = (data.user?.app_metadata || {}) as UserAppMetadata
  const destination = getRoleDashboard(appMetadata.role || null)
  redirect(destination)
}

// =============================================
// Logout
// =============================================
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// =============================================
// Sign Up
// Automatically:
//   - Confirms email (no verification dance)
//   - Assigns role: super_admin if email matches env var, else agency_owner
//   - Immediately signs in and redirects to dashboard
// =============================================
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Determine role
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || ''
  const role = email === superAdminEmail ? 'super_admin' : 'agency_owner'

  // Use the Supabase admin client (service role) to create the user
  // This bypasses email confirmation and lets us set app_metadata immediately
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm — no email needed
    app_metadata: { role },
  })

  if (createError) {
    // Handle "already registered" gracefully
    if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
      return { error: 'An account with this email already exists. Please sign in instead.' }
    }
    return { error: createError.message }
  }

  if (!newUser.user) {
    return { error: 'Failed to create account. Please try again.' }
  }

  // Now sign in immediately with the regular client
  const supabase = await createClient()
  const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  const appMetadata = (session.user?.app_metadata || {}) as UserAppMetadata
  const destination = getRoleDashboard(appMetadata.role || null)
  redirect(destination)
}
