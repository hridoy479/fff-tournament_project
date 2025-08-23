import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/DashboardSidebar"
import { DashboardNav } from "@/components/DashboardNav"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 p-2 sticky top-0 bg-background z-10 border-b">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">Admin Dashboard</div>
        </div>
        <DashboardNav />
        <div className="p-4 mt-20 md:mt-5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}