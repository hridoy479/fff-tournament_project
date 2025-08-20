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
         
          <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent uppercase">
            FFF Tournaments
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
         
            <Link
              href="/"
              className={`font-semibold hover:text-red-600 dark:hover:text-red-500 transition ${
              pathname === "/" ? "text-red-600 dark:text-red-500" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
              </div>
            </Link>
            <Link
              href="/tournaments"
              className={`font-semibold hover:text-red-600 dark:hover:text-red-500 transition ${
              pathname === "/tournaments" ? "text-red-600 dark:text-red-500" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
              <Gamepad2 className="h-4 w-4" />
              <span>Tournaments</span>
              </div>
            </Link>
            <Link
              href="/contact"
              className={`font-semibold hover:text-red-600 dark:hover:text-red-500 transition ${
              pathname === "/contact" ? "text-red-600 dark:text-red-500" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
              <Users2 className="h-4 w-4" />
              <span>Contact</span>
              </div>
            </Link>
         
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

              <Sheet open={isUserSidebarOpen} onOpenChange={setIsUserSidebarOpen}>
  <SheetContent
    side="right"
    className="bg-white dark:bg-[#0f172a] text-black dark:text-white px-6 py-8 shadow-2xl"
  >
    {/* Header */}
  

    {/* User Info */}
    <div className="flex flex-col space-y-4">
      <p className="font-semibold text-base truncate">{user.email}</p>
      <Button
        variant="outline"
        onClick={handleLogout}
        className="rounded-xl border-gray-300 dark:border-gray-600"
      >
        Logout
      </Button>
    </div>

    {/* Divider */}
    <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

    {/* Links */}
    <div className="flex flex-col space-y-3">
      <Link
        href="/profile"
        onClick={closeUserSidebar}
        className="text-center bg-gray-100 dark:bg-gray-800 border rounded-xl py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        Profile
      </Link>

      {/* Add Money */}
      <Link
        href="/add-money"
        onClick={closeUserSidebar}
        className="text-center bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 text-sm font-medium transition shadow-md"
      >
        Add Money
      </Link>

      {user.email === "hridoymolla479@gmail.com" && (
        <Link
          href="/dashboard"
          onClick={closeUserSidebar}
          className="text-center bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 text-sm font-medium transition shadow-md"
        >
          Dashboard
        </Link>
      )}
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
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsMobileMenuOpen(true)}
      className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>

  <SheetContent
    side="right"
    className="bg-white dark:bg-[#0f172a] text-black dark:text-white px-6 py-8 shadow-2xl"
  >
    

    {/* Navigation Links */}
    <nav className="flex flex-col mt-8 space-y-6">
      {[
        { href: "/", label: "Home" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/contact", label: "Contact" },
      ].map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-lg font-medium transition-colors ${
            pathname === link.href
              ? "text-red-600 dark:text-red-500"
              : "hover:text-red-600 dark:hover:text-red-500"
          }`}
          onClick={closeMobileMenu}
        >
          {link.label}
        </Link>
      ))}
    </nav>

    {/* Divider */}
    <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

    {/* Auth Section */}
    {!loading && !user && (
      <Link href={"/login"} onClick={closeMobileMenu}>
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-base shadow-md">
          <Gamepad2 className="mr-2 h-5 w-5" />
          Register
        </Button>
      </Link>
    )}

    {!loading && user && (
      <div className="flex flex-col space-y-4 mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {user.email}
        </p>

        <Button
          variant="outline"
          onClick={() => {
            handleLogout();
            closeMobileMenu();
          }}
          className="rounded-xl border-gray-300 dark:border-gray-600"
        >
          Logout
        </Button>

        <Link
          href="/profile"
          onClick={closeMobileMenu}
          className="text-center text-sm font-medium hover:text-red-600 dark:hover:text-red-500 transition"
        >
          Profile
        </Link>

        {user.email === "hridoymolla479@gmail.com" && (
          <Link
            href="/dashboard"
            className="text-center bg-gray-100 dark:bg-gray-800 border rounded-xl py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
        )}
      </div>
    )}
  </SheetContent>
</Sheet>


        </div>
      </div>
    </header>
  );
}
