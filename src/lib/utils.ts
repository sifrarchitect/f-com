import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx + tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in BDT (Bangladeshi Taka)
 */
export function formatBDT(amount: number): string {
  return `BDT ${amount.toLocaleString('en-BD')}`
}

/**
 * Format currency with explicit BDT suffix
 */
export function formatBDTLabel(amount: number): string {
  return `${amount.toLocaleString('en-BD')} BDT`
}

/**
 * Format a date for Bangladesh timezone display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(date))
}

/**
 * Format date + time for Bangladesh
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dhaka',
  }).format(new Date(date))
}

/**
 * Relative time (e.g., "2 hours ago")
 */
export function timeAgo(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

/**
 * Generate a URL-safe slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

/**
 * Supabase error code mapping for user-friendly messages
 */
export const supabaseErrorMap: Record<string, string> = {
  '23505': 'This record already exists.',
  '23503': 'Referenced record not found.',
  'PGRST116': 'Record not found.',
  '42501': 'You do not have permission for this action.',
}

/**
 * Map Supabase error to user-friendly message
 */
export function getSupabaseErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code && supabaseErrorMap[error.code]) {
    return supabaseErrorMap[error.code]
  }
  return 'Something went wrong. Please try again.'
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercent: number
): number {
  return Math.round(originalPrice * (1 - discountPercent / 100))
}

/**
 * Get the store URL for a shop under an agency
 */
export function getStoreUrl(agencySlug: string, shopSlug: string): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'fmanager.com'
  return `https://${agencySlug}.${domain}/store/${shopSlug}`
}

/**
 * Sanitize slug: only lowercase alphanumeric and hyphens
 */
export function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/g, '')
}

/**
 * Get the dashboard URL for a given role.
 * Pure function — safe for both client and server.
 */
export function getRoleDashboard(role: string | null): string {
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
