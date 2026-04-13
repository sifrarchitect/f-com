'use client'

import SidebarShell from '@/components/shared/SidebarShell'
import NotificationBell from '@/components/shared/NotificationBell'
import UserMenu from '@/components/shared/UserMenu'
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Ban,
  Receipt,
  FileEdit,
  Shield,
} from 'lucide-react'
import type { AuthUser } from '@/lib/auth'

interface AdminSidebarProps {
  user: AuthUser
  children: React.ReactNode
}

export default function AdminSidebar({ user, children }: AdminSidebarProps) {
  return (
    <SidebarShell
      brand={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">F·Manager</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <NotificationBell userId={user.id} />
        </div>
      }
      sections={[
        {
          links: [
            { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Agencies', href: '/admin/agencies', icon: <Building2 className="w-4 h-4" /> },
            { label: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
          ],
        },
        {
          title: 'Platform',
          links: [
            { label: 'Blacklist', href: '/admin/blacklist', icon: <Ban className="w-4 h-4" /> },
            { label: 'Billing', href: '/admin/billing', icon: <Receipt className="w-4 h-4" /> },
            { label: 'CMS', href: '/admin/cms', icon: <FileEdit className="w-4 h-4" /> },
          ],
        },
      ]}
      footer={
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <UserMenu email={user.email} role={user.role || 'super_admin'} />
          </div>
        </div>
      }
    >
      {children}
    </SidebarShell>
  )
}
