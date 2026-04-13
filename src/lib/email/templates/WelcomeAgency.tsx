import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Link,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeAgencyProps {
  agencyName: string
  ownerName: string
  panelUrl: string
}

export default function WelcomeAgency({
  agencyName = 'Agency Name',
  ownerName = 'Admin',
  panelUrl = 'https://agency.fmanager.com',
}: WelcomeAgencyProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to F-Manager, {agencyName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
            <Text style={{ color: '#FAFAFA', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0' }}>F·Manager</Text>
          </Section>

          <Heading style={h1}>Welcome aboard! 🎉</Heading>

          <Text style={text}>
            Hi {ownerName}, welcome to F-Manager — Bangladesh&apos;s f-commerce platform.
          </Text>

          <Text style={text}>
            Your agency <strong>{agencyName}</strong> is now live. Here&apos;s what you can do:
          </Text>

          <Section style={card}>
            <Text style={feature}>🏷️ <strong>White-Label Your Platform</strong> — Upload your logo, set your brand colors, use your own domain</Text>
            <Text style={feature}>💰 <strong>Create Pricing Plans</strong> — Set your own prices, charge sellers what you want</Text>
            <Text style={feature}>🏪 <strong>Onboard Sellers</strong> — Invite f-commerce sellers to your platform</Text>
            <Text style={feature}>📊 <strong>Track Everything</strong> — Orders, revenue, payments — all in one dashboard</Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Link href={panelUrl} style={button}>Go to Dashboard →</Link>
          </Section>

          <Text style={{ ...text, color: '#888', fontSize: '13px', marginTop: '32px' }}>
            Need help? Reply to this email or contact us at hello@fmanager.com
          </Text>

          <Hr style={divider} />
          <Text style={footer}>F-Manager • Built for Bangladesh F-Commerce</Text>
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
const feature = { color: '#FAFAFA', fontSize: '14px', lineHeight: '24px', margin: '0 0 12px' }
const divider = { borderColor: '#222222', margin: '24px 0' }
const button = { backgroundColor: '#FAFAFA', color: '#0A0A0A', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none' }
const footer = { color: '#555555', fontSize: '12px', textAlign: 'center' as const, marginTop: '24px' }
