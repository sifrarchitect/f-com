import { NextRequest } from 'next/server'

/**
 * Resend Email Webhook (for bounce/delivery tracking)
 * Full implementation in Session 2
 */
export async function POST(request: NextRequest) {
  // TODO: Session 2 — Resend webhook handling
  return Response.json({ success: true })
}

export async function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
