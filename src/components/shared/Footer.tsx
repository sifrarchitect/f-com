'use client'

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold tracking-tight mb-3">F·Manager</p>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Bangladesh&apos;s most powerful F-Commerce platform.
              Manage your Facebook &amp; Instagram business from one place.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} F-Manager by Team Sifr. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            hello@fmanager.com
          </p>
        </div>
      </div>
    </footer>
  )
}
