// =============================================
// F-Manager — Phone Normalization Utility
// CRITICAL: Call normalizePhone() on EVERY phone number before:
// - Storing in orders.customer_phone
// - Looking up in customer_blacklist
// - Displaying in order detail
// - Passing to Steadfast API
// =============================================

/**
 * Normalize a Bangladeshi phone number to +8801XXXXXXXXX format.
 * Handles: 01XXXXXXXXX, 8801XXXXXXXXX, +8801XXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.length === 11 && digits.startsWith('01')) return '+880' + digits
  if (digits.length === 13 && digits.startsWith('880')) return '+' + digits
  if (digits.length === 14) return '+' + digits
  return phone // fallback: return as-is
}

/**
 * Validate a Bangladeshi phone number.
 * Must match: +8801[3-9]XXXXXXXX
 */
export function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^\+8801[3-9]\d{8}$/.test(normalized)
}

/**
 * Format phone for display: +880 1XXX-XXXXXX
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.length === 14 && normalized.startsWith('+880')) {
    return `+880 ${normalized.slice(4, 8)}-${normalized.slice(8)}`
  }
  return phone
}
