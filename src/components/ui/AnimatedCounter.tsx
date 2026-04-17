'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  type?: 'number' | 'currency'
  className?: string
  delay?: number
}

export function AnimatedCounter({ value, type = 'number', className = '', delay = 0 }: AnimatedCounterProps) {
  const [mounted, setMounted] = useState(false)
  const springValue = useSpring(0, { stiffness: 50, damping: 20 })
  
  const formatter = (val: number) => {
    if (type === 'currency') return `৳${val.toLocaleString()} BDT`
    return val.toLocaleString()
  }

  const displayValue = useTransform(springValue, (current) => formatter(Math.floor(current)))

  useEffect(() => {
    setMounted(true)
    const timeout = setTimeout(() => {
      springValue.set(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay, springValue])

  if (!mounted) {
    return <span className={className}>{formatter(value)}</span>
  }

  return <motion.span className={className}>{displayValue}</motion.span>
}
