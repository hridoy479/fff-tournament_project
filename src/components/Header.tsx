'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "./ui/ModeTogle";
import { Menu, Home, Gamepad2, Users2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";  // Your custom auth hook with Firebase
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

const navLinks = [
  { name: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Tournaments", href: "/tournaments", icon: <Gamepad2 className="h-4 w-4" /> },
  { name: "Contact", href: "/contact", icon: <Users2 className="h-4 w-4" /> },
];

export default function Header() {
  const pathname = usePathname();

  const { user, loading } = useAuth();

  // Sidebar state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sidebar state for avatar menu (user profile)
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);

  // Close handlers
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeUserSidebar = () => setIsUserSidebarOpen(false);

  // Logout function
  const handleLogout = async () => {
    await signOut(auth);
    setIsUserSidebarOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#111827] text-[#1E1E1E] dark:text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo with Avatar */}
        <Link href="/" className="flex items-center space-x-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src="./Logo.png" />
            <AvatarFallback>FF</AvatarFallback>
          </Avatar>
          <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent uppercase">
            FFF Esports
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`font-semibold hover:text-red-600 dark:hover:text-red-500 transition ${
                pathname === link.href ? "text-red-600 dark:text-red-500" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                {link.icon}
                <span>{link.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />

          {!loading && !user && (
            <Link href="/login">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Register
              </Button>
            </Link>
          )}

          {!loading && user && (
            <>
              <Avatar
                className="h-10 w-10 cursor-pointer"
                onClick={() => setIsUserSidebarOpen(true)}
              >
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <Sheet
                open={isUserSidebarOpen}
                onOpenChange={setIsUserSidebarOpen}
              >
                <SheetContent
                  side="right"
                  className="bg-white dark:bg-[#111827] text-black dark:text-white p-6"
                >
                  <div className="flex flex-col space-y-4">
                    <p className="font-semibold text-lg truncate">{user.email}</p>
                    <Button variant="outline" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                  <Link href='/profile' className="text-center bg-accent border rounded-sm py-1 text-sm" onClick={closeUserSidebar}>Profile</Link>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white dark:bg-[#111827] text-black dark:text-white p-6"
            >
              <nav className="flex flex-col space-y-6 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-lg font-semibold hover:text-red-600 dark:hover:text-red-500 transition ${
                      pathname === link.href
                        ? "text-red-600 dark:text-red-500"
                        : ""
                    }`}
                    onClick={closeMobileMenu} // Close menu on click
                  >
                    {link.name}
                  </Link>
                ))}

                {!loading && !user && (
                  <Link href={"/login"} onClick={closeMobileMenu}>
                    <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Register
                    </Button>
                  </Link>
                )}

                {!loading && user && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <p className="text-sm truncate">{user.email}</p>
                    <Button variant="outline" onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}>
                      Logout
                    </Button>
                    <Link href='/profile' onClick={closeMobileMenu}>Profile</Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
