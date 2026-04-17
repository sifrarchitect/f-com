'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Laptop, ShoppingCart, Users, Package, Settings, Home, HardDrive, ShieldAlert, CreditCard } from 'lucide-react'

type PaletteType = 'admin' | 'agency' | 'shop'

interface GlobalCommandPaletteProps {
  type: PaletteType
}

export function GlobalCommandPalette({ type }: GlobalCommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  // Define commands generically based on tenant type
  const commandGroups = []

  if (type === 'admin') {
    commandGroups.push({
      heading: 'Pages',
      items: [
        { name: 'Dashboard', icon: Home, route: '/admin' },
        { name: 'Agencies', icon: Building2Icon, route: '/admin/agencies' },
        { name: 'Global Orders', icon: ShoppingCart, route: '/admin/orders' },
        { name: 'Blacklist', icon: ShieldAlert, route: '/admin/blacklist' },
      ],
    })
    commandGroups.push({
      heading: 'CMS',
      items: [
        { name: 'Homepage Editor', icon: Laptop, route: '/admin/cms' },
      ],
    })
  } else if (type === 'agency') {
    commandGroups.push({
      heading: 'Pages',
      items: [
        { name: 'Agency Overview', icon: Home, route: '/agency' },
        { name: 'Manage Shops', icon: StoreIcon, route: '/agency/shops' },
        { name: 'Agency Orders', icon: ShoppingCart, route: '/agency/orders' },
      ],
    })
    commandGroups.push({
      heading: 'Settings',
      items: [
        { name: 'Pricing Plans', icon: CreditCard, route: '/agency/settings/plans' },
        { name: 'Branding & Domain', icon: Settings, route: '/agency/settings/branding' },
        { name: 'Billing', icon: HardDrive, route: '/agency/billing' },
      ],
    })
  } else if (type === 'shop') {
    commandGroups.push({
      heading: 'Store Management',
      items: [
        { name: 'Dashboard', icon: Home, route: '/dashboard' },
        { name: 'Manage Products', icon: Package, route: '/dashboard/products' },
        { name: 'Add New Product', icon: PlusIcon, route: '/dashboard/products/new' },
        { name: 'Orders', icon: ShoppingCart, route: '/dashboard/orders' },
      ],
    })
    commandGroups.push({
      heading: 'Settings',
      items: [
        { name: 'Store Configuration', icon: Settings, route: '/dashboard/store' },
        { name: 'Payments Integration', icon: CreditCard, route: '/dashboard/payments' },
        { name: 'Billing', icon: HardDrive, route: '/dashboard/billing' },
      ],
    })
  }

  return (
    <>
      <p className="hidden md:flex text-sm text-muted-foreground items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer fixed bottom-4 left-4 z-50 bg-black/50 px-2.5 py-1.5 rounded-full border border-border backdrop-blur-md" onClick={() => setOpen(true)}>
        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd> to jump
      </p>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commandGroups.map((group) => (
            <div key={group.heading}>
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.route}
                    onSelect={() => runCommand(() => router.push(item.route))}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

function Building2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}

function StoreIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 9.782v-.126A1.666 1.666 0 0 1 3.667 8h16.666A1.666 1.666 0 0 1 22 9.656v.126a2.222 2.222 0 0 1-2.222 2.222H4.222A2.222 2.222 0 0 1 2 9.782Z" />
    </svg>
  )
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
