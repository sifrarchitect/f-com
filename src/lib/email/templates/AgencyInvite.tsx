import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import * as React from 'react'

interface AgencyInviteProps {
  agencyName: string
  ownerName?: string
  slug: string
  loginUrl: string
}

export default function AgencyInvite({
  agencyName = 'Agency Name',
  ownerName = 'Admin',
  slug = 'my-agency',
  loginUrl = 'https://my-agency.fmanager.com/login',
}: AgencyInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>Your agency "{agencyName}" is ready on F-Manager</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
            <Text style={{ color: '#FAFAFA', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0' }}>F·Manager</Text>
          </Section>

          <Heading style={h1}>Welcome to F-Manager!</Heading>

          <Text style={text}>
            Hi {ownerName}, your agency <strong>{agencyName}</strong> has been created on F-Manager.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Your Agency Details</Text>
            <Hr style={divider} />
            <Text style={detail}><strong>Agency:</strong> {agencyName}</Text>
            <Text style={detail}><strong>Subdomain:</strong> {slug}.fmanager.com</Text>
            <Text style={detail}><strong>Panel URL:</strong> https://{slug}.fmanager.com</Text>
          </Section>

          <Section style={card}>
            <Text style={cardLabel}>Next Steps</Text>
            <Text style={step}>1. Login and set your password</Text>
            <Text style={step}>2. Upload your logo and set your brand color</Text>
            <Text style={step}>3. Create pricing plans for your sellers</Text>
            <Text style={step}>4. Invite your first seller</Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Link href={loginUrl} style={button}>Get Started →</Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>F-Manager • Built for Bangladesh F-Commerce</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#0A0A0A', fontFamily: 'system-ui, -apple-system, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }
const h1 = { color: '#FAFAFA', fontSize: '28px', fontWeight: 700 as const, margin: '0 0 16px' }
const text = { color: '#FAFAFA', fontSize: '16px', lineHeight: '24px', margin: '0 0 24px' }
const card = { backgroundColor: '#141414', border: '1px solid #222222', borderRadius: '8px', padding: '20px', marginBottom: '16px' }
const cardLabel = { color: '#888888', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px' }
const detail = { color: '#FAFAFA', fontSize: '14px', lineHeight: '28px', margin: '0' }
const step = { color: '#FAFAFA', fontSize: '14px', lineHeight: '28px', margin: '0', paddingLeft: '8px' }
const divider = { borderColor: '#222222', margin: '16px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
