import { NextRequest } from 'next/server'

/**
 * RuxSpeed Payment Verification Webhook
 * Full implementation in Session 8
 */
export async function POST(request: NextRequest) {
  // TODO: Session 8 — HMAC verification, SMS parsing, order matching
  return Response.json({ success: false, error: 'Not yet implemented' }, { status: 501 })
}

export async function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
