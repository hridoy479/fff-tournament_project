'use client'
import Link from 'next/link'
import { Home, ListChecks, Gamepad2 } from 'lucide-react'
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
 
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/tournaments" className="flex items-center gap-2">
                    <Gamepad2 />
                    <span>Manage Tournaments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/add-tournament" className="flex items-center gap-2">
                    <Gamepad2 />
                    <span>Add Tournament</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/alert-management" className="flex items-center gap-2">
                    <ListChecks />
                    <span>Alert Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}


