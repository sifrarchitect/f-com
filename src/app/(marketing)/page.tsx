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
          Bangladesh-এর #1 F-Commerce Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          আপনার Facebook
          <br />
          <span className="text-muted-foreground">ব্যবসা হোক</span>{' '}
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
          অর্ডার ম্যানেজমেন্ট, পেমেন্ট ভেরিফিকেশন, কুরিয়ার ইন্টিগ্রেশন — 
          সব এক জায়গায়। bKash/Nagad অটো-ভেরিফাই। Steadfast কুরিয়ার ওয়ান-ক্লিক।
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
            ফ্রি শুরু করুন
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 border border-border text-sm font-medium rounded-md hover:bg-accent transition-colors"
          >
            ফিচার দেখুন
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
    '১০০০+ অ্যাক্টিভ সেলার',
    'bKash/Nagad অটো-ভেরিফাই',
    'Steadfast কুরিয়ার ইন্টিগ্রেশন',
    'ফ্রি SSL সার্টিফিকেট',
    '২৪/৭ সাপোর্ট',
    'কাস্টম ডোমেইন সাপোর্ট',
    '১০০+ এজেন্সি',
    'বাংলাদেশে তৈরি 🇧🇩',
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
      title: 'অর্ডার ম্যানেজমেন্ট',
      description: 'Facebook পেজ থেকে অর্ডার নিন, ট্র্যাক করুন, ডেলিভারি দিন — সব এক ড্যাশবোর্ডে',
    },
    {
      icon: CreditCard,
      title: 'পেমেন্ট অটো-ভেরিফাই',
      description: 'bKash/Nagad SMS অটোমেটিক ম্যাচ করে। ভুয়া TrxID আর নয়',
    },
    {
      icon: Truck,
      title: 'Steadfast ওয়ান-ক্লিক',
      description: 'একটা ক্লিকে Steadfast কুরিয়ারে পাঠান। ট্র্যাকিং অটো-আপডেট',
    },
  ]

  return (
    <AnimatedSection className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            🛍️ সেলারদের জন্য
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            আপনার F-Commerce ব্যবসা, <br className="hidden md:block" />
            <span className="text-muted-foreground">সুপারচার্জড</span>
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
      title: 'হোয়াইট-লেবেল',
      description: 'আপনার নিজের ব্র্যান্ড, লোগো, কালার, কাস্টম ডোমেইন — সবকিছু আপনার',
    },
    {
      icon: Users,
      title: 'সেলার ম্যানেজমেন্ট',
      description: 'সেলার যোগ করুন, প্ল্যান তৈরি করুন, তাদের অর্ডার ও রেভিনিউ ট্র্যাক করুন',
    },
    {
      icon: BarChart3,
      title: 'রেভিনিউ ড্যাশবোর্ড',
      description: 'সব সেলারের ক্রস-শপ অর্ডার, পেমেন্ট, ও রেভিনিউ দেখুন এক জায়গায়',
    },
  ]

  return (
    <AnimatedSection className="py-24 px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            🏢 এজেন্সিদের জন্য
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            আপনার নিজের SaaS প্ল্যাটফর্ম, <br className="hidden md:block" />
            <span className="text-muted-foreground">আপনার ব্র্যান্ডে</span>
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
    { icon: ShoppingCart, title: 'অর্ডার ম্যানেজমেন্ট', desc: 'ফিল্টার, সার্চ, বাল্ক অ্যাকশন, CSV এক্সপোর্ট' },
    { icon: CreditCard, title: 'পেমেন্ট ভেরিফিকেশন', desc: 'bKash/Nagad/Rocket SMS অটো-ম্যাচ' },
    { icon: Truck, title: 'কুরিয়ার ইন্টিগ্রেশন', desc: 'Steadfast ওয়ান-ক্লিক + রিয়েলটাইম ট্র্যাকিং' },
    { icon: Store, title: 'স্টোরফ্রন্ট', desc: 'মোবাইল-ফার্স্ট প্রোডাক্ট পেজ + চেকআউট' },
    { icon: Globe, title: 'কাস্টম ডোমেইন', desc: 'আপনার নিজের ডোমেইনে চালান' },
    { icon: Shield, title: 'ব্ল্যাকলিস্ট', desc: 'ভুয়া কাস্টমার অটো-ব্লক' },
  ]

  return (
    <AnimatedSection id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            সব ফিচার এক প্ল্যাটফর্মে
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            আপনার F-Commerce ব্যবসার জন্য যা যা দরকার — সব আছে F-Manager-এ
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
      title: 'সাইন আপ করুন',
      description: 'এজেন্সি অ্যাকাউন্ট তৈরি করুন, আপনার ব্র্যান্ড সেটআপ করুন',
    },
    {
      step: '02',
      title: 'সেলার যোগ করুন',
      description: 'Facebook সেলারদের ইনভাইট করুন, তাদের জন্য স্টোর তৈরি করুন',
    },
    {
      step: '03',
      title: 'ইনকাম শুরু',
      description: 'সেলাররা অর্ডার পায়, আপনি মাসিক সাবস্ক্রিপশন পান',
    },
  ]

  return (
    <AnimatedSection id="how-it-works" className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            কিভাবে কাজ করে?
          </h2>
          <p className="text-muted-foreground">
            মাত্র ৩ ধাপে শুরু করুন
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
            সিম্পল প্রাইসিং
          </h2>
          <p className="text-muted-foreground">
            কোনো হিডেন চার্জ নেই
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agency pricing */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-xl border border-border bg-card"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              এজেন্সি
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">৳১০০</span>
              <span className="text-muted-foreground">/সেলার/মাস</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Team Sifr-কে পে করবেন প্রতি অ্যাক্টিভ সেলারের জন্য। আপনি সেলারদের থেকে যা ইচ্ছা চার্জ করতে পারেন।
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'হোয়াইট-লেবেল ব্র্যান্ডিং',
                'আনলিমিটেড সেলার',
                'কাস্টম ডোমেইন',
                'ক্রস-শপ ড্যাশবোর্ড',
                'কাস্টম প্রাইসিং প্ল্যান',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-fm-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              এজেন্সি হিসেবে শুরু করুন
            </Link>
          </motion.div>

          {/* Seller pricing */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-xl border border-border/50 bg-background"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              সেলার
            </p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-muted-foreground">এজেন্সি</span>
              <span className="text-muted-foreground">নির্ধারিত</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              আপনার এজেন্সি যে প্ল্যান দেয়, সেটাই। কোনো এক্সট্রা চার্জ F-Manager-এর পক্ষ থেকে নেই।
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'প্রোডাক্ট ম্যানেজমেন্ট',
                'অর্ডার ড্যাশবোর্ড',
                'পেমেন্ট ভেরিফিকেশন',
                'Steadfast ইন্টিগ্রেশন',
                'কাস্টমার স্টোরফ্রন্ট',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full py-3 text-center border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              সেলার হিসেবে জয়েন করুন
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
            আজই শুরু করুন
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            আপনার F-Commerce ব্যবসা পরের লেভেলে নিয়ে যান। ফ্রি সেটআপ, কোনো ক্রেডিট কার্ড লাগবে না।
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all group"
          >
            ফ্রি অ্যাকাউন্ট তৈরি করুন
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
