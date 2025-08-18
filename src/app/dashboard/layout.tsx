import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/DashboardSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 p-2 sticky top-0 bg-background z-10 border-b">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">Admin Dashboard</div>
        </div>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}