// =============================================
// F-Manager — RuxSpeed Payment Verification
// Full webhook implementation: Session 8
// =============================================

import crypto from 'crypto'

/**
 * Verify HMAC-SHA256 signature from RuxSpeed webhook.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyRuxspeedSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * SMS parsing patterns for Bangladeshi mobile banking providers
 */
export const SMS_PATTERNS = {
  bkash: /Tk\s*([\d,]+\.?\d*).*TrxID\s*([A-Z0-9]+)/i,
  nagad: /Tk\s*([\d,]+\.?\d*).*Ref\s*([A-Z0-9]+)/i,
  rocket: /BDT\s*([\d,]+\.?\d*).*Ref\s*([A-Z0-9]+)/i,
}

export interface ParsedSms {
  amount: number
  trxId: string
  provider: 'bkash' | 'nagad' | 'rocket'
}

/**
 * Parse SMS text to extract transaction ID and amount.
 * Returns null if no pattern matches.
 */
export function parseSmsText(smsText: string): ParsedSms | null {
  for (const [provider, pattern] of Object.entries(SMS_PATTERNS)) {
    const match = smsText.match(pattern)
    if (match) {
      const amountStr = match[1].replace(/,/g, '')
      return {
        amount: Math.round(parseFloat(amountStr)),
        trxId: match[2],
        provider: provider as ParsedSms['provider'],
      }
    }
  }
  return null
}

/**
 * Check if amount matches within tolerance (±5 BDT for rounding)
 */
export function isAmountMatch(
  extractedAmount: number,
  expectedAmount: number,
  tolerance: number = 5
): boolean {
  return Math.abs(extractedAmount - expectedAmount) <= tolerance
}
