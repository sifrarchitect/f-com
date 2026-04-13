'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

export interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
}

export interface SidebarSection {
  title?: string
  links: SidebarLink[]
}

interface SidebarShellProps {
  brand: React.ReactNode
  sections: SidebarSection[]
  footer: React.ReactNode
  children: React.ReactNode
}

export default function SidebarShell({
  brand,
  sections,
  footer,
  children,
}: SidebarShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="p-4 border-b border-border">
          {brand}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-6' : ''}>
              {section.title && (
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <span className="shrink-0 w-4 h-4">{link.icon}</span>
                        <span className="truncate">{link.label}</span>
                        {link.badge !== undefined && (
                          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          {footer}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-sidebar transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {brand}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-6' : ''}>
              {section.title && (
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <span className="shrink-0 w-4 h-4">{link.icon}</span>
                        <span className="truncate">{link.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          {footer}
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 p-3 border-b border-border md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">{brand}</div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
