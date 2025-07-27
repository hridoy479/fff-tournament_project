"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ModeToggle } from "@/components/ui/ModeTogle";
import { Menu, Home, Gamepad2, Users2 } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Tournaments", href: "/tournaments", icon: <Gamepad2 className="h-4 w-4" /> },
  { name: "Contact", href: "/contact", icon: <Users2 className="h-4 w-4" /> },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#111827] text-[#1E1E1E] dark:text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo with Avatar */}
        <Link href="/" className="flex items-center space-x-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/logo.png" />
            <AvatarFallback>FF</AvatarFallback>
          </Avatar>
          <span className="text-xl font-bold hover:text-red-600 dark:hover:text-red-500 transition">
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
          <Link href="/register/login">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Register
          </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white dark:bg-[#111827] text-black dark:text-white p-6">
              <nav className="flex flex-col space-y-6 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-lg font-semibold hover:text-red-600 dark:hover:text-red-500 transition ${
                      pathname === link.href ? "text-red-600 dark:text-red-500" : ""
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link href={"/register/login"} className="text-lg font-semibold hover:text-red-600 dark:hover:text-red-500 transition">  
                <Button className={`mt-4 bg-red-600 hover:bg-red-700 text-white w-full ${pathname === '/register' ? 'bg-blue-300' : ''}`}>
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Register
                </Button></Link>
              
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}