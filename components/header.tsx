"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ui/theme-toggle";
import { LanguageToggle } from "./ui/language-toggle";
import { Menu, X } from "lucide-react";
import { AuthButton } from "./auth-button";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're in admin route
  const isAdminRoute = pathname?.includes("/administrador");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent scrolling when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled || isMobileMenuOpen
        ? 'bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center"
          >
            <span className="text-2xl font-bold tracking-tight transition-all duration-300 ease-out hover:tracking-wide" style={{ fontFamily: 'LOT, sans-serif' }}>
              HUNT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/eventos"
              className="px-4 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-muted hover:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground rounded-full"
            >
              Eventos
            </Link>
            <Link
              href="/productor"
              className="px-4 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-muted hover:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground rounded-full"
            >
              Productor
            </Link>
            <Link
              href="/sobre-nosotros"
              className="px-4 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-muted hover:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground rounded-full"
            >
              Sobre Nosotros
            </Link>
          </nav>
        </div>

        {/* Right side - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <AuthButton />
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Right side - Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {!isAdminRoute && (
            <>
              <LanguageToggle />
              <ThemeToggle />

              <button
                className="flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-zinc-900 dark:text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-zinc-900 dark:text-white" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu - Dropdown from Header */}
      <div
        className={`fixed top-16 left-0 right-0 md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 45 }}
      >
        {/* Glass Background with its own blur */}
        <div className="bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-white/10 shadow-2xl">
          {/* Menu Content */}
          <nav className="flex flex-col items-center gap-4 px-6 py-6 max-w-sm mx-auto">
            <Link
              href="/eventos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-6 py-3 text-lg font-semibold text-foreground/80 transition-all duration-200 hover:text-foreground hover:scale-105 rounded-xl hover:bg-muted/50 dark:hover:bg-accent/30"
            >
              Eventos
            </Link>
            <Link
              href="/productor"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-6 py-3 text-lg font-semibold text-foreground/80 transition-all duration-200 hover:text-foreground hover:scale-105 rounded-xl hover:bg-muted/50 dark:hover:bg-accent/30"
            >
              Productor
            </Link>
            <Link
              href="/sobre-nosotros"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-6 py-3 text-lg font-semibold text-foreground/80 transition-all duration-200 hover:text-foreground hover:scale-105 rounded-xl hover:bg-muted/50 dark:hover:bg-accent/30"
            >
              Sobre Nosotros
            </Link>

            <div className="mt-4 w-full flex justify-center border-t border-white/10 pt-6">
              <AuthButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
