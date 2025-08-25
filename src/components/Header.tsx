'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "./ui/ModeTogle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

import {
  Menu,
  Home,
  Gamepad2,
  Users2,
  ChevronDown,
  Crown,
  Dice5,
  Smartphone,
  LayoutDashboard,
  DollarSign
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeUserSidebar = () => setIsUserSidebarOpen(false);

  const handleLogout = async () => {
    await signOut(auth);
    setIsUserSidebarOpen(false);
  };

  const isAdmin = user?.firebaseUser?.email === "hridoymolla479@gmail.com";

  const tournamentCategories = [
    { name: "Free Fire", href: "/tournaments/category/freefire", icon: <Gamepad2 className="h-4 w-4" /> },
    { name: "Ludo King", href: "/tournaments/category/ludoking", icon: <Dice5 className="h-4 w-4" /> },
    { name: "E-Football", href: "/tournaments/category/efootball", icon: <Crown className="h-4 w-4" /> },
    { name: "Mobile Legends", href: "/tournaments/category/mobilelegends", icon: <Smartphone className="h-4 w-4" /> },
    { name: "All Tournaments", href: "/tournaments" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FFF Tournaments
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`flex items-center space-x-1 font-medium px-3 py-2 rounded-md transition-colors ${pathname === "/"
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          {/* Tournaments Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`flex items-center space-x-1 font-medium px-3 py-2 rounded-md ${pathname.startsWith("/tournaments")
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Tournaments</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-2">
              {tournamentCategories.map((category) => (
                <DropdownMenuItem key={category.name} asChild>
                  <Link
                    href={category.href}
                    className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/contact"
            className={`flex items-center space-x-1 font-medium px-3 py-2 rounded-md transition-colors ${pathname === "/contact"
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Users2 className="h-4 w-4" />
            <span>Contact</span>
          </Link>
          <Link
            href="/joined-tournaments"
            className={`flex items-center space-x-1 font-medium px-3 py-2 rounded-md transition-colors ${pathname === "/joined-tournaments"
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>My Mach</span>
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard"
              className={`flex items-center space-x-1 font-medium px-3 py-2 rounded-md transition-colors ${pathname === "/dashboard"
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ModeToggle />

          {!loading && !user && (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Register / Login
              </Button>
            </Link>
          )}

          {!loading && user && (
            <>
              <Avatar
                className="h-9 w-9 cursor-pointer border-2 border-gray-200 dark:border-gray-800"
                onClick={() => setIsUserSidebarOpen(true)}
              >
                <AvatarImage src={user.firebaseUser.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {user.firebaseUser.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <Sheet open={isUserSidebarOpen} onOpenChange={setIsUserSidebarOpen}>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.firebaseUser.photoURL || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {user.firebaseUser.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firebaseUser.displayName || "User"}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.firebaseUser.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-auto">
                      <Link
                        href="/profile"
                        onClick={closeUserSidebar}
                        className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/add-money"
                        onClick={closeUserSidebar}
                        className="flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-100 dark:border-blue-900 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-colors"
                      >
                        <DollarSign className="h-4 w-4 mr-2"/>
                        <span className="font-medium">Add Money</span>
                      </Link>
                      <Link
                        href="/withdraw-money"
                        onClick={closeUserSidebar}
                        className="flex items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/50 dark:to-teal-950/50 border border-green-100 dark:border-green-900 hover:from-green-100 hover:to-teal-100 dark:hover:from-green-900/50 dark:hover:to-teal-900/50 transition-colors"
                      >
                        <DollarSign className="h-4 w-4 mr-2"/>
                        <span className="font-medium">Withdraw Money</span>
                      </Link>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
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
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={closeMobileMenu}
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                      <Gamepad2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      FFF Tournaments
                    </span>
                  </Link>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                  <nav className="space-y-4">
                    <Link
                      href="/"
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${pathname === "/"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>

                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button
                          className="flex items-center justify-between w-full p-3 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="flex items-center space-x-2">
                            <Gamepad2 className="h-4 w-4" />
                            <span>Tournaments</span>
                          </span>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="space-y-2 mt-2 pl-6">
                        {tournamentCategories.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${pathname === category.href
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                          >
                            {category.icon}
                            <span>{category.name}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    <Link
                      href="/contact"
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${pathname === "/contact"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <Users2 className="h-4 w-4" />
                      <span>Contact</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${pathname === "/dashboard"
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                  </nav>

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
                    {!loading && !user && (
                      <Link href="/login" onClick={closeMobileMenu}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          Register / Login
                        </Button>
                      </Link>
                    )}

                    {!loading && user && (
                      <>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.firebaseUser.photoURL || undefined} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {user.firebaseUser.email?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.firebaseUser.displayName || "User"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.firebaseUser.email}</p>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          onClick={closeMobileMenu}
                          className="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Profile
                        </Link>

                        <Link
                          href="/add-money"
                          onClick={closeMobileMenu}
                          className="block p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-100 dark:border-blue-900 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-colors font-medium"
                        >
                          Add Money
                        </Link>
                        <Link
                          href="/withdraw-money"
                          onClick={closeMobileMenu}
                          className="block p-3 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/50 dark:to-teal-950/50 border border-green-100 dark:border-green-900 hover:from-green-100 hover:to-teal-100 dark:hover:from-green-900/50 dark:hover:to-teal-900/50 transition-colors font-medium"
                        >
                          Withdraw Money
                        </Link>
                        <Link
                          href="/joined-tournaments"
                          onClick={closeMobileMenu}
                          className="block p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-100 dark:border-blue-900 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-colors font-medium">
                          My Match
                        </Link>

                        <Button
                          variant="outline"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                          className="w-full mt-4"
                        >
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}