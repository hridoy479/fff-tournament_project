'use client'
import { Calendar, Home, IceCream, Inbox, Search, Settings } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Add", url: "#", icon: IceCream },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
]

export function AppSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Sidebar for desktop */}
      <aside className="hidden md:fixed md:top-0 md:left-0 md:h-full md:w-64 md:bg-gradient-to-b md:from-indigo-600 md:to-blue-400 md:shadow-lg md:flex md:flex-col">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 bg-indigo-700 text-white font-bold text-xl tracking-wide shadow">
            FFF Tournament
          </div>
          <nav className="flex-1 px-4 py-8 space-y-2">
            {items.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-indigo-500 transition-colors font-medium"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 text-xs text-indigo-100 text-center">
            &copy; {new Date().getFullYear()} FFF Tournament
          </div>
        </div>
      </aside>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-blue-400 shadow-t flex justify-around items-center py-2 md:hidden">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className="flex flex-col items-center text-white hover:text-yellow-300 transition-colors"
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}