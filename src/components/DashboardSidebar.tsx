'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Home, ListChecks, Gamepad2 } from 'lucide-react'
import { Loader2 } from 'lucide-react' // spinner icon
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

export default function DashboardSidebar() {
  // Track which menu item is loading
  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  // Handle click
  const handleClick = (item: string) => {
    setLoadingItem(item)
    // Optionally: reset loading after a short delay if using Link (for demo)
    setTimeout(() => setLoadingItem(null), 1000)
  }

  // Sidebar menu items data
  const menuItems = [
    { label: 'Overview', icon: <Home />, href: '/dashboard', key: 'overview' },
    { label: 'Manage Tournaments', icon: <Gamepad2 />, href: '/dashboard/tournaments', key: 'manage' },
    { label: 'Add Tournament', icon: <Gamepad2 />, href: '/dashboard/add-tournament', key: 'add' },
    { label: 'Alert Management', icon: <ListChecks />, href: '/dashboard/alert-management', key: 'alert' },
    { label: 'Balance Management', icon: <ListChecks />, href: '/dashboard/balance-management', key: 'balance' },
    { label: 'User Management', icon: <ListChecks />, href: '/dashboard/user-management', key: 'user' },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <div className="text-xl font-bold">Admin</div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2"
                      onClick={() => handleClick(item.key)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {loadingItem === item.key && (
                        <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
