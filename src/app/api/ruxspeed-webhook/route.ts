import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// RuxSpeed SMS parsing regexes
const TRXID_PATTERNS = [
  /TrxID[:\s]+([A-Z0-9]{8,20})/i,
  /Transaction\s*ID[:\s]+([A-Z0-9]{8,20})/i,
  /Ref[:\s]+([A-Z0-9]{8,20})/i,
  /([A-Z]{2,3}[0-9]{8,15})/,  // bKash/Nagad format e.g. AA2412182345
]
const AMOUNT_PATTERN = /(?:Tk|BDT)[.\s]*([\d,]+(?:\.\d{1,2})?)/i

function parseSms(sms: string): { trxId: string | null; amount: number | null } {
  let trxId: string | null = null
  for (const pat of TRXID_PATTERNS) {
    const m = sms.match(pat)
    if (m) { trxId = m[1]; break }
  }

  let amount: number | null = null
  const amountMatch = sms.match(AMOUNT_PATTERN)
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''))
  }

  return { trxId, amount }
}

export async function POST(request: NextRequest) {
  // 1. Read raw body for HMAC verification
  const rawBody = await request.text()
  const signature = request.headers.get('x-ruxspeed-signature') || ''

  // Global webhook secret from env
  const webhookSecret = process.env.RUXSPEED_WEBHOOK_SECRET || ''

  if (webhookSecret) {
    // Timing-safe HMAC-SHA256 comparison
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
    const expectedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSig) {
      return Response.json({ error: 'invalid_signature' }, { status: 401 })
    }
  }

  let payload: {
    shop_secret_key?: string
    sms_text?: string
    sms_from?: string
    trx_id?: string
    amount?: number
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Service role client — no cookies in webhooks
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 2. Find shop by payment_secret_key
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, ruxspeed_enabled')
    .eq('payment_secret_key', payload.shop_secret_key || '')
    .eq('is_active', true)
    .single()

  if (!shop) {
    // Log invalid secret attempt
    await supabase.from('payment_webhook_log').insert({
      result: 'invalid_signature',
      raw_payload: payload as Record<string, unknown>,
      sms_text: payload.sms_text || null,
    } as never)
    return Response.json({ error: 'shop_not_found' }, { status: 404 })
  }

  const shopData = shop as { id: string; name: string; ruxspeed_enabled: boolean }
  if (!shopData.ruxspeed_enabled) {
    return Response.json({ error: 'ruxspeed_disabled' }, { status: 403 })
  }

  // 3. Parse SMS text (or use direct trx_id if provided)
  const smsText = payload.sms_text || ''
  let extractedTrxId = payload.trx_id || null
  let extractedAmount = payload.amount || null

  if (!extractedTrxId && smsText) {
    const parsed = parseSms(smsText)
    extractedTrxId = parsed.trxId
    extractedAmount = parsed.amount
  }

  if (!extractedTrxId) {
    await supabase.from('payment_webhook_log').insert({
      shop_id: shopData.id,
      sms_text: smsText || null,
      sms_from: payload.sms_from || null,
      result: 'not_found',
      raw_payload: payload as Record<string, unknown>,
    } as never)
    return Response.json({ error: 'trx_id_not_found' }, { status: 422 })
  }

  // 4. Find pending order with this TrxID 
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, payment_amount_expected, payment_status, customer_email, customer_name, total_price, shop_id')
    .eq('shop_id', shopData.id)
    .eq('payment_trx_id', extractedTrxId)
    .eq('payment_status', 'pending')
    .single()

  // 5. Check for duplicate (already verified)
  if (!order) {
    const { data: dupOrder } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('shop_id', shopData.id)
      .eq('payment_trx_id', extractedTrxId)
      .single()

    const result = dupOrder ? 'duplicate' : 'not_found'
    await supabase.from('payment_webhook_log').insert({
      shop_id: shopData.id,
      sms_text: smsText || null,
      sms_from: payload.sms_from || null,
      extracted_trx_id: extractedTrxId,
      extracted_amount: extractedAmount,
      result,
      raw_payload: payload as Record<string, unknown>,
    } as never)
    return Response.json({ success: false, result }, { status: 200 })
  }

  const o = order as {
    id: string; order_number: string; payment_amount_expected: number | null;
    payment_status: string; customer_email: string | null; customer_name: string;
    total_price: number; shop_id: string
  }

  // 6. Validate amount (±5 BDT tolerance)
  const expectedAmount = o.payment_amount_expected || o.total_price
  let result: 'verified' | 'amount_mismatch' = 'verified'

  if (extractedAmount !== null && Math.abs(extractedAmount - expectedAmount) > 5) {
    result = 'amount_mismatch'
    await supabase.from('payment_webhook_log').insert({
      shop_id: shopData.id,
      sms_text: smsText || null,
      sms_from: payload.sms_from || null,
      extracted_trx_id: extractedTrxId,
      extracted_amount: extractedAmount,
      matched_order_id: o.id,
      result: 'amount_mismatch',
      raw_payload: payload as Record<string, unknown>,
    } as never)
    return Response.json({ success: false, result: 'amount_mismatch' }, { status: 200 })
  }

  // 7. Update order to verified
  await supabase
    .from('orders')
    .update({ payment_status: 'verified' } as never)
    .eq('id', o.id)

  // 8. Log success
  await supabase.from('payment_webhook_log').insert({
    shop_id: shopData.id,
    sms_text: smsText || null,
    sms_from: payload.sms_from || null,
    extracted_trx_id: extractedTrxId,
    extracted_amount: extractedAmount,
    matched_order_id: o.id,
    result: 'verified',
    raw_payload: payload as Record<string, unknown>,
  } as never)

  // 9. Send PaymentVerified email (fire-and-forget)
  if (o.customer_email) {
    try {
      const { sendPaymentVerified } = await import('@/lib/email/send')
      await sendPaymentVerified({
        to: o.customer_email,
        customerName: o.customer_name,
        orderNumber: o.order_number,
        totalPrice: o.total_price,
        paymentMethod: 'bkash',
        shopName: shopData.name,
      })
    } catch { /* ignore */ }
  }

  return Response.json({ success: true, order_number: o.order_number })
}

export async function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
