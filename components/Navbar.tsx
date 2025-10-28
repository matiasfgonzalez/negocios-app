"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Store, Shield, Home, LogIn, Info } from "lucide-react";
import CustomUserMenu from "./CustomUserMenu";

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { href: "/", label: "Inicio", icon: Home },
      { href: "/#negocios", label: "Negocios", icon: Store },
      { href: "/about", label: "Sobre Nosotros", icon: Info },
    ];

    if (isSignedIn) {
      // Add role-specific navigation
      const role = user?.publicMetadata?.role as string;

      if (
        role === "ADMINISTRADOR" ||
        role === "PROPIETARIO" ||
        role === "CLIENTE"
      ) {
        baseItems.push({
          href: "/dashboard",
          label: "Dashboard",
          icon: Shield,
        });
      }
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    // UI improved: Enhanced navbar with better backdrop blur and border
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* UI improved: Enhanced logo with better hover effects */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative w-9 h-9 bg-white dark:bg-white rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105 p-1">
              <Image
                src="/logo.PNG"
                alt="BarrioMarket Logo"
                width={36}
                height={36}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-200">
              BarrioMarket
            </span>
          </Link>

          {/* UI improved: Enhanced desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* UI improved: Enhanced desktop auth & theme section */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {!isLoaded ? (
              <div className="w-9 h-9 bg-muted rounded-full animate-pulse" />
            ) : isSignedIn ? (
              <CustomUserMenu />
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 border border-primary/20">
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              </SignInButton>
            )}
          </div>

          {/* UI improved: Enhanced mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
              aria-label="Abrir menú principal"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* UI improved: Enhanced mobile navigation with better animations */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
            <div className="px-2 pt-3 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* UI improved: Enhanced mobile auth section */}
            <div className="border-t border-border px-2 pt-3 pb-3">
              {!isLoaded ? (
                <div className="px-3 py-2">
                  <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : isSignedIn ? (
                <div className="px-3 py-2">
                  <CustomUserMenu />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-base font-medium text-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Iniciar Sesión</span>
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
