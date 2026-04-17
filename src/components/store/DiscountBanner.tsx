'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { DiscountTimer } from '@/types/database'

interface DiscountBannerProps {
  timer: DiscountTimer
  brandColor: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function computeRemaining(endsAt: string): { h: number; m: number; s: number; expired: boolean } {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now())
  const totalSec = Math.floor(diff / 1000)
  if (totalSec <= 0) return { h: 0, m: 0, s: 0, expired: true }
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    expired: false,
  }
}

export default function DiscountBanner({ timer, brandColor }: DiscountBannerProps) {
  const [time, setTime] = useState(() => computeRemaining(timer.ends_at))
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(computeRemaining(timer.ends_at))
    }, 1000)
    return () => clearInterval(interval)
  }, [timer.ends_at])

  if (dismissed || time.expired) return null

  return (
    <div
      className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium text-white"
      style={{ backgroundColor: brandColor }}
    >
      <span className="font-bold">{timer.discount_percent}% OFF</span>
      <span className="opacity-80">·</span>
      <span>{timer.label}</span>
      <span className="opacity-80">ends in</span>
      <span className="font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md">
        {time.h > 0 && `${pad(time.h)}:`}{pad(time.m)}:{pad(time.s)}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 p-1 rounded-full hover:bg-black/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
