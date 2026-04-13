import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — F-Manager',
  description: 'F-Manager privacy policy. How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <article className="max-w-3xl mx-auto prose-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: April 2025
        </p>

        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              F-Manager (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a multi-tenant f-commerce SaaS platform operated by Team Sifr. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>Name, email address, and phone number when you create an account</li>
              <li>Business information (shop name, address) for agency and seller accounts</li>
              <li>Payment information (bKash/Nagad merchant numbers) for payment processing</li>
              <li>Order data including customer names, phone numbers, and delivery addresses</li>
              <li>Product information including images, descriptions, and pricing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>To provide, maintain, and improve our platform</li>
              <li>To process orders and facilitate payments between buyers and sellers</li>
              <li>To verify payment transactions via SMS parsing (bKash/Nagad/Rocket)</li>
              <li>To send notifications about orders, payments, and account activity</li>
              <li>To generate invoices and manage billing</li>
              <li>To enforce our terms of service and prevent fraud (customer blacklist)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>
              We share your information with third parties only as necessary to provide our services:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground mt-3">
              <li><strong>Steadfast Courier:</strong> Delivery address and phone number for shipment fulfillment</li>
              <li><strong>Resend:</strong> Email address for transactional emails</li>
              <li><strong>Supabase:</strong> Data storage and authentication provider</li>
              <li><strong>Agency operators:</strong> Agencies can see data for shops under their management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Security</h2>
            <p>
              We use industry-standard security measures including Row Level Security (RLS) policies, 
              encrypted connections (TLS), HMAC signature verification for webhooks, and role-based 
              access control. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Order data is retained 
              for accounting and dispute resolution purposes. You may request deletion of your account 
              by contacting us at hello@fmanager.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, contact us at:{' '}
              <a href="mailto:hello@fmanager.com" className="text-foreground underline underline-offset-4">
                hello@fmanager.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}
