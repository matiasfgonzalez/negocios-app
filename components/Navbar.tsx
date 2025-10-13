"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Store, Shield, Home, LogIn } from "lucide-react";
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
    <nav className="bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
              <Store className="w-5 h-5 text-black dark:text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              NegociosApp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth & Theme */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {!isLoaded ? (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : isSignedIn ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {(user?.publicMetadata?.role as string) || "usuario"}
                  </p>
                </div>
                <CustomUserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="cursor-pointer flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                </SignInButton>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-2 pt-3 pb-3">
              {!isLoaded ? (
                <div className="px-3 py-2">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ) : isSignedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                          userButtonPopoverCard:
                            "shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-md",
                          userButtonPopoverHeader:
                            "border-b border-gray-200 dark:border-gray-700 pb-3 mb-3",
                          userButtonPopoverActions: "space-y-1",
                          userButtonPopoverActionButton:
                            "w-full justify-start text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg px-3 py-2 transition-colors duration-200 font-medium",
                          userButtonPopoverActionButtonIcon:
                            "text-primary-500 mr-3",
                          userButtonPopoverFooter: "hidden",
                          userPreviewMainIdentifier:
                            "text-gray-900 dark:text-white font-semibold",
                          userPreviewSecondaryIdentifier:
                            "text-gray-500 dark:text-gray-400 text-sm",
                        },
                        variables: {
                          colorPrimary: "#3b82f6",
                          colorBackground: "transparent",
                          borderRadius: "0.75rem",
                          spacingUnit: "0.5rem",
                        },
                      }}
                    />
                    <div>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {(user?.publicMetadata?.role as string) || "usuario"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <SignInButton mode="modal">
                    <button
                      className="cursor-pointer flex items-center space-x-2 w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
