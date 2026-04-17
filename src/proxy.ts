// =============================================
// F-Manager — Proxy (Next.js 16+)
// Replaces: src/middleware.ts
//
// Routing table:
//   admin.fmanager.com/*        → /admin/*
//   fmanager.com/*              → /* (marketing)
//   [slug].fmanager.com/*       → /agency/* (agency dashboard)
//   [slug].fmanager.com/dashboard/* → /dashboard/* (shop dashboard)
//   [slug].fmanager.com/store/* → /store/* (customer store)
// =============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'fmanager.com'

interface AgencyData {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  is_active: boolean
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] || ''
  const url = request.nextUrl.clone()

  // ─── Guard: missing env vars → pass through silently ────────────────────
  // Without Supabase creds, let pages handle their own auth rather than crash
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // Build a Supabase client that works in the proxy context
  let supabase
  try {
    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })
  } catch {
    // Client creation failed — pass through safely
    return NextResponse.next()
  }

  // Refresh session and get role
  let role: string | undefined
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    role = authUser?.app_metadata?.role as string | undefined
  } catch {
    // Auth failure — treat as unauthenticated
  }

  // ─── 0. Local development ────────────────────────────────────────────────
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (url.pathname.startsWith('/admin') && role !== 'super_admin')
      return NextResponse.redirect(new URL('/login', request.url))
    if (url.pathname.startsWith('/agency') && role !== 'agency_owner' && role !== 'super_admin')
      return NextResponse.redirect(new URL('/login', request.url))
    if (url.pathname.startsWith('/dashboard') && role !== 'shop_owner' && role !== 'agency_owner' && role !== 'super_admin')
      return NextResponse.redirect(new URL('/login', request.url))
    return response
  }

  // ─── 1. Super Admin panel: admin.fmanager.com ────────────────────────────
  if (hostname === `admin.${APP_DOMAIN}`) {
    if (role !== 'super_admin')
      return NextResponse.redirect(new URL('/login', request.url))
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url, { headers: response.headers })
  }

  // ─── 2. Main marketing site: fmanager.com ────────────────────────────────
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    return response
  }

  // ─── 3. Agency subdomain or custom domain ────────────────────────────────
  let agencySlug: string | null = null
  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    agencySlug = hostname.replace(`.${APP_DOMAIN}`, '')
  }

  // ─── 4. Lookup agency ────────────────────────────────────────────────────
  let agencyData: AgencyData | null = null
  try {
    if (agencySlug) {
      const { data } = await supabase
        .from('agencies')
        .select('id, name, logo_url, primary_color, is_active')
        .eq('slug', agencySlug)
        .single()
      agencyData = data as AgencyData | null
    } else {
      const { data } = await supabase
        .from('agencies')
        .select('id, name, logo_url, primary_color, is_active')
        .eq('custom_domain', hostname)
        .single()
      agencyData = data as AgencyData | null
    }
  } catch {
    // DB lookup failure — fall through to redirect
  }

  // Unknown domain → redirect to main site
  if (!agencyData) {
    return NextResponse.redirect(new URL('/', `https://${APP_DOMAIN}`))
  }

  // Agency suspended
  if (!agencyData.is_active) {
    url.pathname = '/suspended'
    return NextResponse.rewrite(url)
  }

  // ─── 5. Route rewriting ──────────────────────────────────────────────────
  const pathname = url.pathname
  const skipRewritePrefixes = ['/dashboard', '/store', '/track', '/login', '/signup', '/suspended', '/api', '/auth', '/welcome']
  const shouldRewrite = !skipRewritePrefixes.some(p => pathname.startsWith(p))

  if (shouldRewrite && pathname !== '/') {
    url.pathname = `/agency${pathname}`
  } else if (pathname === '/') {
    url.pathname = '/agency'
  }

  // ─── 6. Role-based security at the edge ──────────────────────────────────
  if (url.pathname.startsWith('/agency') && role !== 'agency_owner' && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (url.pathname.startsWith('/dashboard') && role !== 'shop_owner' && role !== 'agency_owner' && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Inject agency context headers for downstream use
  const rewriteResponse = NextResponse.rewrite(url)
  rewriteResponse.headers.set('x-agency-id', agencyData.id)
  rewriteResponse.headers.set('x-agency-name', agencyData.name)
  rewriteResponse.headers.set('x-agency-logo', agencyData.logo_url || '')
  rewriteResponse.headers.set('x-agency-color', agencyData.primary_color)

  return rewriteResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
