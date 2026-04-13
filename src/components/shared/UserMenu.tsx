'use client'

import { useState } from 'react'
import { logout } from '@/lib/actions/auth'
import { LogOut, User, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  email: string
  role: string
}

export default function UserMenu({ email, role }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  const roleLabel = {
    super_admin: 'Super Admin',
    agency_owner: 'Agency Owner',
    shop_owner: 'Shop Owner',
  }[role] || role

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full rounded-md px-2 py-2 text-sm hover:bg-sidebar-accent transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium truncate">{email}</p>
          <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
        </div>
        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 z-50 rounded-md border border-border bg-popover shadow-xl overflow-hidden">
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
