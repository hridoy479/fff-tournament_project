"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  Loader2, 
  Home, 
  Trophy, 
  PlusCircle, 
  Bell 
} from "lucide-react"

export function DashboardNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [loadingTab, setLoadingTab] = useState<string | null>(null)

  const handleTabChange = (value: string) => {
    if (value === pathname) return
    
    setLoadingTab(value)
    router.push(value)
  }

  // Reset loading state when navigation completes
  useEffect(() => {
    setLoadingTab(null)
  }, [pathname])

  return (
    <div className="flex flex-row gap-2 h-auto pt-10 md:hidden fixed top-10 bg-none left-0 right-0 z-50 bg-background border-b px-4 py-2">
      <Tabs value={pathname} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex w-full justify-around bg-muted/50 p-1 rounded-lg h-auto">
          <TabsTrigger 
            value="/dashboard" 
            className="flex flex-col items-center h-12 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            disabled={loadingTab !== null}
          >
            {loadingTab === "/dashboard" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Home className="h-4 w-4 mb-1" />
                <span className="text-xs">Overview</span>
              </>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="/dashboard/tournaments" 
            className="flex flex-col items-center h-12 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            disabled={loadingTab !== null}
          >
            {loadingTab === "/dashboard/tournaments" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Trophy className="h-4 w-4 mb-1" />
                <span className="text-xs">Tournaments</span>
              </>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="/dashboard/add-tournament" 
            className="flex flex-col items-center h-12 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            disabled={loadingTab !== null}
          >
            {loadingTab === "/dashboard/add-tournament" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mb-1" />
                <span className="text-xs">Add</span>
              </>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="/dashboard/alert-management" 
            className="flex flex-col items-center h-12 w-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            disabled={loadingTab !== null}
          >
            {loadingTab === "/dashboard/alert-management" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Bell className="h-4 w-4 mb-1" />
                <span className="text-xs">Alerts</span>
              </>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}