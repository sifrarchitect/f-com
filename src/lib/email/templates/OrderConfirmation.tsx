import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Row,
  Column,
} from '@react-email/components'
import * as React from 'react'

interface OrderConfirmationProps {
  customerName: string
  orderNumber: string
  productName: string
  variantLabel?: string
  quantity: number
  unitPrice: number
  deliveryFee: number
  discountAmount?: number
  totalPrice: number
  deliveryZone: string
  customerAddress: string
  paymentMethod?: string
  merchantNumber?: string
  shopName: string
  agencyLogo?: string
  trackUrl: string
}

export default function OrderConfirmation({
  customerName = 'Rahim',
  orderNumber = 'FM-001000',
  productName = 'Premium T-Shirt',
  variantLabel,
  quantity = 1,
  unitPrice = 500,
  deliveryFee = 60,
  discountAmount = 0,
  totalPrice = 560,
  deliveryZone = 'Inside Dhaka',
  customerAddress = 'Dhaka, Bangladesh',
  paymentMethod,
  merchantNumber,
  shopName = 'My Store',
  agencyLogo,
  trackUrl = 'https://fmanager.com/track/FM-001000',
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Order Confirmed — {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {agencyLogo && (
            <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
              <img src={agencyLogo} alt="" height="40" style={{ margin: '0 auto' }} />
            </Section>
          )}

          <Heading style={h1}>Order Confirmed ✓</Heading>

          <Text style={text}>
            Thanks <strong>{customerName}</strong>, your order is confirmed!
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Order Number</Text>
            <Text style={cardValue}>{orderNumber}</Text>
          </Section>

          <Section style={card}>
            <Text style={cardLabel}>Order Summary</Text>
            <Hr style={divider} />
            <Row>
              <Column><Text style={tableText}>{productName}{variantLabel ? ` — ${variantLabel}` : ''}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={tableText}>Quantity</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={tableText}>×{quantity}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={tableText}>Unit Price</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={tableText}>{unitPrice} BDT</Text></Column>
            </Row>
            {discountAmount > 0 && (
              <Row>
                <Column><Text style={{ ...tableText, color: '#00C853' }}>Discount</Text></Column>
                <Column style={{ textAlign: 'right' as const }}><Text style={{ ...tableText, color: '#00C853' }}>-{discountAmount} BDT</Text></Column>
              </Row>
            )}
            <Row>
              <Column><Text style={tableText}>Delivery ({deliveryZone})</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={tableText}>{deliveryFee} BDT</Text></Column>
            </Row>
            <Hr style={divider} />
            <Row>
              <Column><Text style={{ ...tableText, fontWeight: 700 }}>Total</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={{ ...tableText, fontWeight: 700, fontSize: '18px' }}>{totalPrice} BDT</Text></Column>
            </Row>
          </Section>

          <Section style={card}>
            <Text style={cardLabel}>Delivery Address</Text>
            <Text style={tableText}>{customerAddress}</Text>
          </Section>

          {paymentMethod && merchantNumber && (
            <Section style={{ ...card, borderColor: '#FFB300' }}>
              <Text style={cardLabel}>Payment Instructions</Text>
              <Text style={tableText}>
                Send <strong>{totalPrice} BDT</strong> to:
              </Text>
              <Text style={{ ...tableText, fontSize: '18px', fontWeight: 700 }}>
                {paymentMethod.toUpperCase()}: {merchantNumber}
              </Text>
              <Text style={{ ...tableText, color: '#888' }}>
                Send Money (not payment) • Reference: your phone number
              </Text>
            </Section>
          )}

          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Link href={trackUrl} style={button}>
              Track Your Order →
            </Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            {shopName} • Powered by F-Manager
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0A0A0A',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px',
}

const h1 = {
  color: '#FAFAFA',
  fontSize: '28px',
  fontWeight: 700 as const,
  margin: '0 0 16px',
}

const text = {
  color: '#FAFAFA',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const card = {
  backgroundColor: '#141414',
  border: '1px solid #222222',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
}

const cardLabel = {
  color: '#888888',
  fontSize: '12px',
  fontWeight: 600 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 8px',
}

const cardValue = {
  color: '#FAFAFA',
  fontSize: '24px',
  fontWeight: 700 as const,
  fontFamily: 'monospace',
  margin: '0',
}

const tableText = {
  color: '#FAFAFA',
  fontSize: '14px',
  lineHeight: '28px',
  margin: '0',
}

const divider = {
  borderColor: '#222222',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#FAFAFA',
  color: '#0A0A0A',
  padding: '12px 32px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600 as const,
  textDecoration: 'none',
}

const footer = {
  color: '#555555',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '24px',
}
