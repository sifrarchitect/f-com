import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'F-Manager — Bangladesh\'s F-Commerce Platform',
    template: '%s | F-Manager',
  },
  description:
    'Bangladesh\'s most powerful F-Commerce platform. From Messenger chaos to professional online store — in minutes.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fmanager.com'),
  openGraph: {
    title: 'F-Manager — Bangladesh\'s F-Commerce Platform',
    description:
      'White-label f-commerce SaaS with bKash/Nagad payment verification and Steadfast courier integration.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      translate="no"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  )
}
