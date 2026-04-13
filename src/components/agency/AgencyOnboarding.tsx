'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, X, Palette, CreditCard, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 'branding',
    title: 'Set Up Your Brand',
    description: 'Upload your logo and set your brand color',
    icon: Palette,
    href: '/agency/settings/branding',
    cta: 'Go to Branding',
  },
  {
    id: 'first_plan',
    title: 'Create Your First Plan',
    description: 'Set pricing for your sellers',
    icon: CreditCard,
    href: '/agency/settings/plans',
    cta: 'Create Plan',
  },
  {
    id: 'first_shop',
    title: 'Invite Your First Seller',
    description: 'Add a shop and send an invite',
    icon: Store,
    href: '/agency/shops',
    cta: 'Add Shop',
  },
]

interface AgencyOnboardingProps {
  completedSteps: string[]
  dismissed: boolean
  onDismiss: () => void
  onComplete: (step: string) => void
}

export default function AgencyOnboarding({
  completedSteps,
  dismissed,
  onDismiss,
  onComplete,
}: AgencyOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(() => {
    const firstIncomplete = STEPS.findIndex(
      (s) => !completedSteps.includes(s.id)
    )
    return firstIncomplete >= 0 ? firstIncomplete : STEPS.length - 1
  })

  const allDone = STEPS.every((s) => completedSteps.includes(s.id))

  if (dismissed || allDone) return null

  const step = STEPS[currentStep]
  const progress = (completedSteps.length / STEPS.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold">Getting Started</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Steps list */}
          <div className="p-5 space-y-3">
            {STEPS.map((s, i) => {
              const done = completedSteps.includes(s.id)
              const active = i === currentStep
              const Icon = s.icon

              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={cn(
                    'w-full flex items-center gap-4 p-3 rounded-lg border transition-all text-left',
                    active
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-transparent hover:bg-accent/30',
                    done && 'opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      done
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        done && 'line-through text-muted-foreground'
                      )}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.description}
                    </p>
                  </div>
                  {active && !done && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Action */}
          <div className="p-5 border-t border-border flex items-center justify-between">
            <button
              onClick={onDismiss}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            {!completedSteps.includes(step.id) && (
              <button
                onClick={() => router.push(step.href)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {step.cta}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
