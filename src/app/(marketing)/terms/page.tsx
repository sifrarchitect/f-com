import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — F-Manager',
  description: 'F-Manager terms of service. Rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <article className="max-w-3xl mx-auto prose-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: April 2025
        </p>

        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using F-Manager (&quot;the Platform&quot;), you agree to be bound by these 
              Terms of Service. F-Manager is operated by Team Sifr. If you do not agree with any 
              part of these terms, you must not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Account Types</h2>
            <p className="mb-3">The Platform supports four account types:</p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li><strong>Super Admin:</strong> Platform administrators (Team Sifr)</li>
              <li><strong>Agency:</strong> White-label resellers who manage seller accounts</li>
              <li><strong>Shop Owner (Seller):</strong> F-commerce sellers managing their stores</li>
              <li><strong>Customer:</strong> Buyers who purchase products through seller stores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Agency Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>Agencies must pay 100 BDT per active shop per month to Team Sifr</li>
              <li>Agencies are responsible for managing their own seller relationships</li>
              <li>Agencies may set their own pricing plans for sellers</li>
              <li>Agencies must not use the Platform for any illegal or prohibited purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Seller Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>Sellers must provide accurate product information and pricing</li>
              <li>Sellers are responsible for order fulfillment and customer service</li>
              <li>Sellers must comply with all applicable Bangladeshi e-commerce regulations</li>
              <li>Sellers must not sell prohibited, counterfeit, or illegal products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Payment Processing</h2>
            <p>
              F-Manager facilitates payment verification through bKash, Nagad, and Rocket SMS parsing. 
              We do not process payments directly. All financial transactions occur between the buyer 
              and seller. F-Manager is not liable for payment disputes between buyers and sellers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Account Termination</h2>
            <p>
              Team Sifr reserves the right to suspend or terminate any account that violates these 
              terms, engages in fraudulent activity, or fails to pay platform fees. Agencies may 
              suspend seller accounts under their management.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>
              F-Manager is provided &quot;as is&quot; without warranties of any kind. Team Sifr is not 
              liable for any indirect, incidental, or consequential damages arising from the use of 
              the Platform. Our total liability shall not exceed the fees paid by you in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of 
              Bangladesh. Any disputes shall be resolved in the courts of Dhaka, Bangladesh.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, contact us at:{' '}
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
