import Link from 'next/link'
import { Clock, Mail } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3">Account Confirmed!</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Your email has been verified. Your account is pending role assignment by an administrator.
          You&apos;ll receive an email once access has been granted.
        </p>

        <div className="fm-card p-5 text-left space-y-3 mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What happens next?</p>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <p className="text-muted-foreground">An agency owner will assign you a shop, or contact Team Sifr if you&apos;re an agency.</p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <p className="text-muted-foreground">Once your role is set, sign in and you&apos;ll be redirected to your dashboard automatically.</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
          <a
            href="mailto:hello@fmanager.com"
            className="px-5 py-2.5 border border-border text-sm font-medium rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
