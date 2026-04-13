'use client'

import SidebarShell from '@/components/shared/SidebarShell'
import NotificationBell from '@/components/shared/NotificationBell'
import UserMenu from '@/components/shared/UserMenu'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Palette,
  CreditCard,
  Receipt,
} from 'lucide-react'
import type { AuthUser } from '@/lib/auth'

interface ShopSidebarProps {
  user: AuthUser
  children: React.ReactNode
}

export default function ShopSidebar({ user, children }: ShopSidebarProps) {
  return (
    <SidebarShell
      brand={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">F·Manager</span>
          </div>
          <NotificationBell userId={user.id} />
        </div>
      }
      sections={[
        {
          links: [
            { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Orders', href: '/dashboard/orders', icon: <ShoppingCart className="w-4 h-4" /> },
            { label: 'Products', href: '/dashboard/products', icon: <Package className="w-4 h-4" /> },
          ],
        },
        {
          title: 'Settings',
          links: [
            { label: 'Store', href: '/dashboard/store', icon: <Palette className="w-4 h-4" /> },
            { label: 'Payments', href: '/dashboard/payments', icon: <CreditCard className="w-4 h-4" /> },
            { label: 'Billing', href: '/dashboard/billing', icon: <Receipt className="w-4 h-4" /> },
          ],
        },
      ]}
      footer={
        <UserMenu email={user.email} role={user.role || 'shop_owner'} />
      }
    >
      {children}
    </SidebarShell>
  )
}
