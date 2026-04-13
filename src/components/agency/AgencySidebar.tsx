'use client'

import SidebarShell from '@/components/shared/SidebarShell'
import NotificationBell from '@/components/shared/NotificationBell'
import UserMenu from '@/components/shared/UserMenu'
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Palette,
  CreditCard,
  Receipt,
  Sparkles,
} from 'lucide-react'
import type { AuthUser } from '@/lib/auth'

interface AgencySidebarProps {
  user: AuthUser
  children: React.ReactNode
}

export default function AgencySidebar({ user, children }: AgencySidebarProps) {
  return (
    <SidebarShell
      brand={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">F·Manager</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase tracking-wider">
              Agency
            </span>
          </div>
          <NotificationBell userId={user.id} />
        </div>
      }
      sections={[
        {
          links: [
            { label: 'Dashboard', href: '/agency', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Shops', href: '/agency/shops', icon: <Store className="w-4 h-4" /> },
            { label: 'Orders', href: '/agency/orders', icon: <ShoppingCart className="w-4 h-4" /> },
          ],
        },
        {
          title: 'Settings',
          links: [
            { label: 'Branding', href: '/agency/settings/branding', icon: <Palette className="w-4 h-4" /> },
            { label: 'Plans', href: '/agency/settings/plans', icon: <Sparkles className="w-4 h-4" /> },
            { label: 'Billing', href: '/agency/billing', icon: <Receipt className="w-4 h-4" /> },
          ],
        },
      ]}
      footer={
        <UserMenu email={user.email} role={user.role || 'agency_owner'} />
      }
    >
      {children}
    </SidebarShell>
  )
}
