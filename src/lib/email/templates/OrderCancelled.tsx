import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import * as React from 'react'

interface OrderCancelledProps {
  customerName: string
  orderNumber: string
  productName: string
  totalPrice: number
  cancellationReason: string
  shopName: string
  contactPhone?: string
}

export default function OrderCancelled({
  customerName = 'Rahim',
  orderNumber = 'FM-001000',
  productName = 'Premium T-Shirt',
  totalPrice = 560,
  cancellationReason = 'Out of stock',
  shopName = 'My Store',
  contactPhone,
}: OrderCancelledProps) {
  return (
    <Html>
      <Head />
      <Preview>Order Cancelled — {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Cancelled</Heading>

          <Text style={text}>
            Hi {customerName}, your order <strong>{orderNumber}</strong> has been cancelled.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Cancellation Details</Text>
            <Hr style={divider} />
            <Text style={detail}><strong>Order:</strong> {orderNumber}</Text>
            <Text style={detail}><strong>Product:</strong> {productName}</Text>
            <Text style={detail}><strong>Amount:</strong> {totalPrice} BDT</Text>
            <Text style={detail}><strong>Reason:</strong> {cancellationReason}</Text>
          </Section>

          <Text style={text}>
            If you had already made a payment, please contact the shop for a refund.
          </Text>

          {contactPhone && (
            <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
              <Link href={`tel:${contactPhone}`} style={button}>Contact Shop →</Link>
            </Section>
          )}

          <Hr style={divider} />
          <Text style={footer}>{shopName} • Powered by F-Manager</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0A0A0A', fontFamily: 'system-ui, -apple-system, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }
const h1 = { color: '#FF3B3B', fontSize: '28px', fontWeight: 700 as const, margin: '0 0 16px' }
const text = { color: '#FAFAFA', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' }
const card = { backgroundColor: '#141414', border: '1px solid #FF3B3B33', borderRadius: '8px', padding: '20px', marginBottom: '16px' }
const cardLabel = { color: '#888888', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px' }
const detail = { color: '#FAFAFA', fontSize: '14px', lineHeight: '28px', margin: '0' }
const divider = { borderColor: '#222222', margin: '16px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
