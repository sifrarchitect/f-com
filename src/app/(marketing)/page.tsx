'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  ShoppingCart, CreditCard, Truck, BarChart3, Shield, Zap,
  Store, Users, ArrowRight, Check, Globe, Palette,
} from 'lucide-react'

// ============================================================
// ANIMATION VARIANTS
// ============================================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ============================================================
// 1. HERO
// ============================================================
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-fm-success animate-pulse" />
          Bangladesh's #1 F-Commerce Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          Your Facebook Business,
          <br />
          <span className="text-muted-foreground">Made</span>{' '}
          <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Professional
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Order management, payment verification, courier integration — 
          all in one place. Auto-verify bKash/Nagad. One-click Steadfast shipping.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            Start Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 border border-border text-sm font-medium rounded-md hover:bg-accent transition-colors"
          >
            View Features
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// 2. SOCIAL PROOF TICKER
// ============================================================
function SocialProofTicker() {
  const items = [
    '1000+ Active Sellers',
    'bKash/Nagad Auto-Verify',
    'Steadfast Courier Integration',
    'Free SSL Certificate',
    '24/7 Support',
    'Custom Domain Support',
    '100+ Agencies',
    'Built in Bangladesh 🇧🇩',
  ]

  return (
    <div className="relative border-y border-border/50 overflow-hidden py-4 bg-card/30">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-sm text-muted-foreground">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 3. FOR SELLERS
// ============================================================
function ForSellers() {
  const cards = [
    {
      icon: ShoppingCart,
      title: 'Order Management',
      description: 'Receive orders from Facebook, track them, manage delivery — all from one dashboard',
    },
    {
      icon: CreditCard,
      title: 'Auto Payment Verify',
      description: 'Automatically match bKash/Nagad SMS. No more fake TrxIDs',
    },
    {
      icon: Truck,
      title: 'Steadfast One-Click',
      description: 'Send to Steadfast courier with one click. Auto-update tracking',
    },
  ]

  return (
    <AnimatedSection className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            🛍️ For Sellers
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Your F-Commerce Business, <br className="hidden md:block" />
            <span className="text-muted-foreground">Supercharged</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="group p-6 rounded-xl border border-border bg-card hover:bg-card/80 hover:border-border/80 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

// ============================================================
// 4. FOR AGENCIES
// ============================================================
function ForAgencies() {
  const cards = [
    {
      icon: Palette,
      title: 'White-Label',
      description: 'Your own brand, logo, colors, custom domain — everything is yours',
    },
    {
      icon: Users,
      title: 'Seller Management',
      description: 'Add sellers, create plans, track their orders and revenue',
    },
    {
      icon: BarChart3,
      title: 'Revenue Dashboard',
      description: 'View cross-shop orders, payments, and revenue from all sellers in one place',
    },
  ]

  return (
    <AnimatedSection className="py-24 px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            🏢 For Agencies
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Your Own SaaS Platform, <br className="hidden md:block" />
            <span className="text-muted-foreground">Under Your Brand</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="group p-6 rounded-xl border border-border bg-background hover:border-border/80 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

// ============================================================
// 5. FEATURES GRID
// ============================================================
function FeaturesGrid() {
  const features = [
    { icon: ShoppingCart, title: 'Order Management', desc: 'Filter, search, bulk actions, CSV export' },
    { icon: CreditCard, title: 'Payment Verification', desc: 'bKash/Nagad/Rocket SMS auto-match' },
    { icon: Truck, title: 'Courier Integration', desc: 'Steadfast one-click + real-time tracking' },
    { icon: Store, title: 'Storefront', desc: 'Mobile-first product pages + checkout' },
    { icon: Globe, title: 'Custom Domain', desc: 'Run on your own domain' },
    { icon: Shield, title: 'Blacklist', desc: 'Auto-block fraudulent customers' },
  ]

  return (
    <AnimatedSection id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            All Features, One Platform
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything your F-Commerce business needs — all in F-Manager
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="p-5 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-all duration-300"
            >
              <f.icon className="h-5 w-5 text-muted-foreground mb-3" />
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

// ============================================================
// 6. HOW IT WORKS
// ============================================================
function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Sign Up',
      description: 'Create an agency account, set up your brand',
    },
    {
      step: '02',
      title: 'Add Sellers',
      description: 'Invite Facebook sellers, create stores for them',
    },
    {
      step: '03',
      title: 'Start Earning',
      description: 'Sellers get orders, you earn monthly subscriptions',
    },
  ]

  return (
    <AnimatedSection id="how-it-works" className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Get started in just 3 steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div key={s.step} variants={fadeUp} className="relative">
              <div className="text-6xl font-bold text-border/50 mb-4">{s.step}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 text-border">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

// ============================================================
// 7. PRICING
// ============================================================
function Pricing() {
  return (
    <AnimatedSection id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple Pricing
          </h2>
          <p className="text-muted-foreground">
            No hidden charges
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agency pricing */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-xl border border-border bg-card"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              Agency
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">100 BDT</span>
              <span className="text-muted-foreground">/seller/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Pay Team Sifr per active seller. Charge your sellers whatever you want.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'White-label branding',
                'Unlimited sellers',
                'Custom domain',
                'Cross-shop dashboard',
                'Custom pricing plans',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-fm-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start as Agency
            </Link>
          </motion.div>

          {/* Seller pricing */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-xl border border-border/50 bg-background"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              Seller
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-muted-foreground">Agency</span>
              <span className="text-muted-foreground">defined</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Your agency sets the plan. No extra charges from F-Manager.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Product management',
                'Order dashboard',
                'Payment verification',
                'Steadfast integration',
                'Customer storefront',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block w-full py-3 text-center border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              Join as Seller
            </Link>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}

// ============================================================
// 8. CTA
// ============================================================
function CtaSection() {
  return (
    <AnimatedSection className="py-24 px-6 bg-card/30">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fadeUp}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Get Started Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Take your F-Commerce business to the next level. Free setup, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all group"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// ============================================================
// ASSEMBLED LANDING PAGE
// ============================================================
export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProofTicker />
      <ForSellers />
      <ForAgencies />
      <FeaturesGrid />
      <HowItWorks />
      <Pricing />
      <CtaSection />
    </>
  )
}
