import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link, Row, Column,
} from '@react-email/components'
import * as React from 'react'

interface NewOrderAlertProps {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  productName: string
  variantLabel?: string
  quantity: number
  totalPrice: number
  paymentMethod?: string
  paymentTrxId?: string
  dashboardUrl: string
  shopName: string
}

export default function NewOrderAlert({
  orderNumber = 'FM-001000',
  customerName = 'Rahim',
  customerPhone = '+8801712345678',
  customerAddress = 'Dhaka, Bangladesh',
  productName = 'Premium T-Shirt',
  variantLabel,
  quantity = 1,
  totalPrice = 560,
  paymentMethod,
  paymentTrxId,
  dashboardUrl = 'https://agency.fmanager.com/dashboard/orders',
  shopName = 'My Store',
}: NewOrderAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>{`🛍 New Order: ${orderNumber} — ${totalPrice} BDT`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🛍 New Order!</Heading>
          <Text style={text}>You have a new order on <strong>{shopName}</strong></Text>

          <Section style={card}>
            <Text style={cardLabel}>Order #{orderNumber}</Text>
            <Hr style={divider} />
            <Row><Column><Text style={label}>Customer</Text></Column><Column><Text style={value}>{customerName}</Text></Column></Row>
            <Row><Column><Text style={label}>Phone</Text></Column><Column><Text style={value}>{customerPhone}</Text></Column></Row>
            <Row><Column><Text style={label}>Address</Text></Column><Column><Text style={value}>{customerAddress}</Text></Column></Row>
            <Hr style={divider} />
            <Row><Column><Text style={label}>Product</Text></Column><Column><Text style={value}>{productName}{variantLabel ? ` — ${variantLabel}` : ''}</Text></Column></Row>
            <Row><Column><Text style={label}>Quantity</Text></Column><Column><Text style={value}>×{quantity}</Text></Column></Row>
            <Row><Column><Text style={label}>Total</Text></Column><Column><Text style={{ ...value, fontWeight: 700, fontSize: '18px' }}>{totalPrice} BDT</Text></Column></Row>
            {paymentMethod && (
              <>
                <Hr style={divider} />
                <Row><Column><Text style={label}>Payment</Text></Column><Column><Text style={value}>{paymentMethod.toUpperCase()}</Text></Column></Row>
                {paymentTrxId && <Row><Column><Text style={label}>TrxID</Text></Column><Column><Text style={{ ...value, fontFamily: 'monospace' }}>{paymentTrxId}</Text></Column></Row>}
              </>
            )}
          </Section>

          <Section style={{ textAlign: 'center' as const }}>
            <Link href={dashboardUrl} style={button}>View Order →</Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>F-Manager • Order Notification</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0A0A0A', fontFamily: 'system-ui, -apple-system, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }
const h1 = { color: '#FAFAFA', fontSize: '28px', fontWeight: 700 as const, margin: '0 0 8px' }
const text = { color: '#FAFAFA', fontSize: '16px', lineHeight: '24px', margin: '0 0 24px' }
const card = { backgroundColor: '#141414', border: '1px solid #222222', borderRadius: '8px', padding: '20px', marginBottom: '24px' }
const cardLabel = { color: '#888888', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px' }
const label = { color: '#888888', fontSize: '13px', margin: '0', lineHeight: '28px' }
const value = { color: '#FAFAFA', fontSize: '14px', margin: '0', lineHeight: '28px', textAlign: 'right' as const }
const divider = { borderColor: '#222222', margin: '12px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
