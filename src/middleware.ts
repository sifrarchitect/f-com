// =============================================
// F-Manager — Edge Middleware
// Handles all subdomain routing + agency context injection
//
// Routing table:
//   admin.fmanager.com/*        → /admin/*
//   fmanager.com/*              → /* (marketing, pass through)
//   [slug].fmanager.com/*       → /* with agency headers injected
//   [custom-domain].com/*       → /* with agency headers injected
//
// The middleware does NOT rewrite paths for agency subdomains.
// Instead, it injects x-agency-* headers that layouts use to
// determine which UI to show. The (marketing) layout checks
// for absence of x-agency-id to show marketing pages.
// =============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'fmanager.com'

interface AgencyData {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  is_active: boolean
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createClient(request, response)
  const hostname = request.headers.get('host')?.split(':')[0] || ''
  const url = request.nextUrl.clone()

  // Refresh session (important for auth)
  await supabase.auth.getUser()

  // 1. Super Admin panel: admin.fmanager.com → rewrite to /admin/*
  if (hostname === `admin.${APP_DOMAIN}`) {
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url, { headers: response.headers })
  }

  // 2. Main marketing site: fmanager.com → pass through (no rewrite needed)
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    return response
  }

  // 3. Agency subdomain or custom domain
  let agencySlug: string | null = null
  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    agencySlug = hostname.replace(`.${APP_DOMAIN}`, '')
  }

  // 4. Lookup agency data
  let agencyData: AgencyData | null = null

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

  // Agency not found → redirect to main site
  if (!agencyData) {
    return NextResponse.redirect(new URL('/', `https://${APP_DOMAIN}`))
  }

  // Agency suspended
  if (!agencyData.is_active) {
    url.pathname = '/suspended'
    return NextResponse.rewrite(url)
  }

  // 5. Rewrite agency subdomain paths to internal route paths:
  //    [slug].fmanager.com/             → /agency (agency dashboard)
  //    [slug].fmanager.com/shops        → /agency/shops
  //    [slug].fmanager.com/orders       → /agency/orders
  //    [slug].fmanager.com/settings/*   → /agency/settings/*
  //    [slug].fmanager.com/billing      → /agency/billing
  //    [slug].fmanager.com/onboarding   → /agency/onboarding
  //    [slug].fmanager.com/dashboard/*  → /dashboard/* (shop admin - no prefix)
  //    [slug].fmanager.com/store/*      → /store/* (customer store - no prefix)
  //    [slug].fmanager.com/login        → /login
  const pathname = url.pathname

  // Shop dashboard and store routes don't need rewriting
  const skipRewritePrefixes = ['/dashboard', '/store', '/track', '/login', '/suspended', '/api']
  const shouldRewrite = !skipRewritePrefixes.some(prefix => pathname.startsWith(prefix))

  if (shouldRewrite && pathname !== '/') {
    url.pathname = `/agency${pathname}`
  } else if (pathname === '/') {
    url.pathname = '/agency'
  }

  // Inject agency context into headers for downstream consumption
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
