// =============================================
// F-Manager — Resend Email Client
// Full template implementations: Session 2
// =============================================

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  try {
    const { data, error } = await resend.emails.send({
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
