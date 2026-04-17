'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Package, CreditCard, Palette, Share2, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 'first_product',
    title: 'Add Your First Product',
    description: 'Create a product with images and pricing',
    icon: Package,
    href: '/dashboard/products/new',
  },
  {
    id: 'payment_setup',
    title: 'Set Up Payments',
    description: 'Add your bKash/Nagad merchant number',
    icon: CreditCard,
    href: '/dashboard/payments',
  },
  {
    id: 'store_customized',
    title: 'Customize Your Store',
    description: 'Set your banner and delivery fees',
    icon: Palette,
    href: '/dashboard/store',
  },
  {
    id: 'first_order',
    title: 'Get Your First Order',
    description: 'Share your store link and receive an order',
    icon: Share2,
    href: '/dashboard/store',
  },
]

interface ShopOnboardingProps {
  completedSteps: string[]
  dismissed: boolean
  onDismiss: () => void
}

export default function ShopOnboarding({
  completedSteps,
  dismissed,
  onDismiss,
}: ShopOnboardingProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(true)

  const allDone = STEPS.every((s) => completedSteps.includes(s.id))

  if (dismissed || allDone) return null

  const progress = (completedSteps.length / STEPS.length) * 100
  const nextStep = STEPS.find((s) => !completedSteps.includes(s.id))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed bottom-4 right-4 z-40 w-80"
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header — always visible */}
          <div
            onClick={() => setExpanded(!expanded)}
            role="button"
            tabIndex={0}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted"
                  />
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${progress} 100`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  {completedSteps.length}/{STEPS.length}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Setup Checklist</p>
                <p className="text-xs text-muted-foreground">
                  {completedSteps.length} of {STEPS.length} complete
                </p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss() }}
              className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Expanded steps */}
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-3 space-y-1">
                {STEPS.map((step) => {
                  const done = completedSteps.includes(step.id)
                  const isNext = step.id === nextStep?.id
                  const Icon = step.icon

                  return (
                    <button
                      key={step.id}
                      onClick={() => !done && router.push(step.href)}
                      disabled={done}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all',
                        done
                          ? 'opacity-50'
                          : isNext
                            ? 'bg-primary/5 border border-primary/20'
                            : 'hover:bg-accent/30'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                          done
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {done ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs font-medium',
                            done && 'line-through text-muted-foreground'
                          )}
                        >
                          {step.title}
                        </p>
                      </div>
                      {isNext && !done && (
                        <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
