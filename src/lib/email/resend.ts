// =============================================
// F-Manager — Resend Email Client
// Full template implementations: Session 2
// =============================================

import { Resend } from 'resend'

// Lazily created so a missing key never crashes the module at evaluation time
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export async function sendEmail({
  to,
  subject,
  react,
  from,
}: {
  to: string | string[]
  subject: string
  react: React.ReactElement
  from?: string
}) {
  const fromAddress =
    from ||
    `${process.env.RESEND_FROM_NAME || 'F-Manager'} <${process.env.RESEND_FROM_EMAIL || 'noreply@fmanager.com'}>`

  // Development bypass: Log emails to terminal if no API key exists
  if (!process.env.RESEND_API_KEY) {
    console.log('----------------------------------------------------')
    console.log(`[LOCAL DEV EMAIL] To: ${to} | Subject: ${subject}`)
    console.log('React Component Props:', react.props)
    console.log('----------------------------------------------------')
    return { data: { id: 'mock-email-id' }, error: null }
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: fromAddress,
      to,
      subject,
      react,
    })
    if (error) {
      console.error('Resend error:', error)
    }
    return { data, error }
  } catch (err) {
    console.error('Email send failed:', err)
    return { data: null, error: err }
  }
}
