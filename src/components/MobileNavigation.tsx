"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, ListChecks, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileNavigation() {
  const pathname = usePathname();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Reset loading state when navigation completes
  useEffect(() => {
    if (prevPathname !== pathname && loadingItem) {
      setLoadingItem(null);
    }
    setPrevPathname(pathname);
  }, [pathname, loadingItem, prevPathname]);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/tournaments", icon: Trophy, label: "Tournament" },
    { href: "/joined-tournaments", icon: ListChecks, label: "My Match" },
    { href: "/contact", icon: Phone, label: "Contact" },
  ];

  const handleClick = (href: string) => {
    // Only set loading if we're navigating to a new page
    if (href !== pathname) {
      setLoadingItem(href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-background border-t">
      <ul className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isLoading = loadingItem === item.href;

          return (
            <li key={item.href} className="flex-1 flex justify-center">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                className={`w-full h-12 flex flex-col items-center justify-center gap-1 ${
                  isActive ? "font-semibold" : ""
                }`}
                onClick={() => handleClick(item.href)}
                disabled={isLoading}
                aria-label={item.label}
                asChild
              >
                <Link href={item.href}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Icon
                        size={20}
                        className={
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                      <span
                        className={`text-xs ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}