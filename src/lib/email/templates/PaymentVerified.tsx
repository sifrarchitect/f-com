import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import * as React from 'react'

interface PaymentVerifiedProps {
  customerName: string
  orderNumber: string
  totalPrice: number
  paymentMethod: string
  trackUrl: string
  shopName: string
}

export default function PaymentVerified({
  customerName = 'Rahim',
  orderNumber = 'FM-001000',
  totalPrice = 560,
  paymentMethod = 'bKash',
  trackUrl = 'https://fmanager.com/track/FM-001000',
  shopName = 'My Store',
}: PaymentVerifiedProps) {
  return (
    <Html>
      <Head />
      <Preview>✅ Payment Verified — {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
            <div style={checkCircle}>✓</div>
          </Section>

          <Heading style={h1}>Payment Verified!</Heading>

          <Text style={text}>
            Hi <strong>{customerName}</strong>, your {paymentMethod} payment of <strong>{totalPrice} BDT</strong> has been received and verified.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Order Number</Text>
            <Text style={cardValue}>{orderNumber}</Text>
            <Hr style={divider} />
            <Text style={{ ...text, color: '#00C853', fontSize: '14px', margin: '0' }}>
              ✅ Payment: {paymentMethod} — {totalPrice} BDT — Verified
            </Text>
          </Section>

          <Text style={text}>
            Your order is now being processed. Tracking info will be shared once shipped.
          </Text>

          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Link href={trackUrl} style={button}>Track Your Order →</Link>
          </Section>

          <Text style={{ ...text, color: '#888', fontSize: '13px', marginTop: '24px' }}>
            Delivered within 2-5 business days
          </Text>

          <Hr style={divider} />
          <Text style={footer}>{shopName} • Powered by F-Manager</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0A0A0A', fontFamily: 'system-ui, -apple-system, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }
const h1 = { color: '#FAFAFA', fontSize: '28px', fontWeight: 700 as const, margin: '0 0 16px', textAlign: 'center' as const }
const text = { color: '#FAFAFA', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' }
const card = { backgroundColor: '#141414', border: '1px solid #222222', borderRadius: '8px', padding: '20px', marginBottom: '16px' }
const cardLabel = { color: '#888888', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px' }
const cardValue = { color: '#FAFAFA', fontSize: '24px', fontWeight: 700 as const, fontFamily: 'monospace', margin: '0' }
const divider = { borderColor: '#222222', margin: '16px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
const checkCircle = { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,200,83,0.1)', border: '2px solid #00C853', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto', fontSize: '32px', color: '#00C853' }
