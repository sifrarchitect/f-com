import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link, Row, Column,
} from '@react-email/components'
import * as React from 'react'

interface InvoiceGeneratedProps {
  agencyName: string
  month: string
  year: number
  activeShopCount: number
  amountBdt: number
  billingUrl: string
}

export default function InvoiceGenerated({
  agencyName = 'Agency Name',
  month = 'April',
  year = 2025,
  activeShopCount = 10,
  amountBdt = 1000,
  billingUrl = 'https://agency.fmanager.com/billing',
}: InvoiceGeneratedProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Invoice for ${month} ${year} — ${amountBdt} BDT due`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
            <Text style={{ color: '#FAFAFA', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0' }}>F·Manager</Text>
          </Section>

          <Heading style={h1}>Invoice Generated</Heading>
          <Text style={text}>Hi {agencyName}, your monthly platform fee invoice is ready.</Text>

          <Section style={card}>
            <Text style={cardLabel}>Invoice Summary — {month} {year}</Text>
            <Hr style={divider} />
            <Row>
              <Column><Text style={label}>Active Shops</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={value}>{activeShopCount}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={label}>Rate per Shop</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={value}>100 BDT</Text></Column>
            </Row>
            <Hr style={divider} />
            <Row>
              <Column><Text style={{ ...label, fontWeight: 700 }}>Total Due</Text></Column>
              <Column style={{ textAlign: 'right' as const }}><Text style={{ ...value, fontSize: '20px', fontWeight: 700 }}>{amountBdt} BDT</Text></Column>
            </Row>
          </Section>

          <Text style={{ ...text, color: '#888', fontSize: '13px' }}>
            Please make payment by end of month. Contact admin for payment instructions.
          </Text>

          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Link href={billingUrl} style={button}>View Invoice →</Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>F-Manager • Platform Billing</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0A0A0A', fontFamily: 'system-ui, -apple-system, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }
const h1 = { color: '#FAFAFA', fontSize: '28px', fontWeight: 700 as const, margin: '0 0 16px' }
const text = { color: '#FAFAFA', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' }
const card = { backgroundColor: '#141414', border: '1px solid #222222', borderRadius: '8px', padding: '20px', marginBottom: '16px' }
const cardLabel = { color: '#888888', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px' }
const label = { color: '#888888', fontSize: '14px', margin: '0', lineHeight: '28px' }
const value = { color: '#FAFAFA', fontSize: '14px', margin: '0', lineHeight: '28px', textAlign: 'right' as const }
const divider = { borderColor: '#222222', margin: '12px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
