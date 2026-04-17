import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import * as React from 'react'

interface ShopInviteProps {
  agencyName: string
  agencyLogo?: string
  shopName: string
  tempPassword?: string
  loginUrl: string
  setupUrl: string
}

export default function ShopInvite({
  agencyName = 'Agency Name',
  agencyLogo,
  shopName = 'My Store',
  tempPassword,
  loginUrl = 'https://agency.fmanager.com/login',
  setupUrl = 'https://agency.fmanager.com/dashboard',
}: ShopInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to {agencyName}&apos;s platform</Preview>
      <Body style={main}>
        <Container style={container}>
          {agencyLogo && (
            <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
              <img src={agencyLogo} alt={agencyName} height="40" style={{ margin: '0 auto' }} />
            </Section>
          )}

          <Heading style={h1}>You&apos;re Invited! 🎉</Heading>

          <Text style={text}>
            <strong>{agencyName}</strong> has created a store for you: <strong>{shopName}</strong>
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Getting Started</Text>
            {tempPassword && <Text style={step}><strong>Temporary Password:</strong> {tempPassword}</Text>}
            <Text style={step}>1. Log in and change your password</Text>
            <Text style={step}>2. Add your first product</Text>
            <Text style={step}>3. Set up bKash/Nagad payment</Text>
            <Text style={step}>4. Share your store link on Facebook</Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Link href={loginUrl} style={button}>Set Up Your Store →</Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>{agencyName} • Powered by F-Manager</Text>
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
const cardLabel = { color: '#888888', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 16px' }
const step = { color: '#FAFAFA', fontSize: '14px', lineHeight: '28px', margin: '0', paddingLeft: '8px' }
const divider = { borderColor: '#222222', margin: '24px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
