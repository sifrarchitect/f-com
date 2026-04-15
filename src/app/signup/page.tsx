'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { ArrowRight, Check, Zap, Mail } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-fm-success/10 border border-fm-success/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-7 w-7 text-fm-success" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            We sent a confirmation link to your email address. Click it to activate your account and get started.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 bg-gradient-to-b from-card to-background border-r border-border relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-primary/3 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            F·Manager
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            Free to get started
          </div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Start selling<br />
            <span className="text-muted-foreground">in minutes, not days.</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Join 1000+ Facebook &amp; Instagram sellers who use F-Manager to run their business professionally.
          </p>

          {/* Benefits */}
          <div className="space-y-3 pt-2">
            {[
              'Free setup — no credit card required',
              'Auto bKash/Nagad payment verification',
              'One-click Steadfast courier shipping',
              'Your own branded storefront',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm">
                <div className="w-5 h-5 rounded-full bg-fm-success/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-fm-success" />
                </div>
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} Team Sifr. All rights reserved.
        </p>
      </div>

      {/* Right — Sign up form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              F·Manager
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Get started with F-Manager for free
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 mt-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full h-11 px-3.5 mt-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground/60 mt-1.5">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>

            <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-muted-foreground">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-muted-foreground">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-foreground font-medium hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
