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
    'Bangladesh-এর সবচেয়ে শক্তিশালী F-Commerce Platform। Messenger chaos থেকে professional online store — মাত্র কয়েক মিনিটে।',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fmanager.com'),
  openGraph: {
    title: 'F-Manager — Bangladesh\'s F-Commerce Platform',
    description:
      'White-label f-commerce SaaS with bKash/Nagad payment verification and Steadfast courier integration.',
    type: 'website',
    locale: 'bn_BD',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
