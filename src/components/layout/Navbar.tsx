"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Menu, X, ChevronDown } from "lucide-react";

// ── Primary nav links (always visible on desktop) ────────────────────────────
const PRIMARY_LINKS = [
  { label: "Home", href: "/" },
  { label: "History", href: "/history" },
  { label: "Family Tree", href: "/tree" },
  { label: "Executive Members", href: "/members" },
];

// ── Secondary links (hidden in "More" dropdown on desktop) ────────────────────
const MORE_LINKS = [
  { label: "Achievers", href: "/achievers" },
  { label: "Obituary", href: "/obituary" },
  { label: "Gallery", href: "/gallery" },
];

// ── All links combined for mobile menu ────────────────────────────────────────
const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on route change so it never gets left open
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  }, [pathname]);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  const isMoreActive = MORE_LINKS.some((link) => pathname === link.href);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[#1b3622]/10 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${isScrolled ? "shadow-sm" : ""
        }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img
            src="/images/logo.png"
            alt="Pullazhiyil Kudumbayogam"
            className="h-9 w-auto shrink-0 object-contain sm:h-11 md:h-12"
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b3622]/55 sm:block">
              Pullazhiyil
            </span>
            <span className="Malayalam-font whitespace-nowrap text-sm font-semibold text-[#1b3622]">
              പുല്ലാഴിയിൽ കുടുംബയോഗം
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden items-center justify-center gap-1 lg:flex">
          {/* Primary links */}
          {PRIMARY_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-3 font-serif text-sm italic tracking-[0.04em] transition-colors duration-200 ${isActive ? "text-[#1b3622]" : "text-[#1b3622]/65 hover:text-[#1b3622]"
                  }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbarActiveUnderline"
                    className="absolute inset-x-3.5 bottom-0 h-[2px] bg-[#d4af37]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              id="navbar-more-dropdown"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              onMouseEnter={() => setIsMoreOpen(true)}
              className={`relative flex items-center gap-1.5 px-3.5 py-3 font-serif text-[15px] italic tracking-[0.04em] transition-colors duration-200 ${isMoreActive ? "text-[#1b3622]" : "text-[#1b3622]/65 hover:text-[#1b3622]"
                }`}
              aria-haspopup="true"
              aria-expanded={isMoreOpen}
            >
              <motion.span
                animate={{ rotate: isMoreOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
              {isMoreActive && (
                <motion.span
                  layoutId="navbarActiveUnderline"
                  className="absolute inset-x-3.5 bottom-0 h-[2px] bg-[#d4af37]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onMouseLeave={() => setIsMoreOpen(false)}
                  className="absolute right-0 top-full mt-1 w-56 origin-top overflow-hidden border border-[#1b3622]/10 bg-white shadow-lg z-50"
                >
                  {MORE_LINKS.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`group flex items-center justify-between border-b border-[#1b3622]/6 px-4 py-3 font-serif text-sm italic tracking-[0.03em] transition-colors duration-150 last:border-b-0 ${isActive
                          ? "bg-[#1b3622]/5 text-[#1b3622]"
                          : "text-[#1b3622]/65 hover:bg-[#fbf9f4] hover:text-[#1b3622]"
                          }`}
                      >
                        <span>{link.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Dashboard button (desktop) */}
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 bg-[#1b3622] px-5 py-3 font-serif text-sm italic tracking-[0.06em] text-[#f8f4e9] transition-colors duration-200 hover:bg-[#234a2c] lg:flex"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="shrink-0 text-[#1b3622] lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[#d4af37]/20 bg-[#1b3622] lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col px-6 py-4">
              {ALL_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`border-b border-white/10 py-3.5 font-serif text-base italic tracking-[0.04em] last:border-b-0 ${isActive ? "text-[#d4af37]" : "text-[#fbf9f4]/85"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                href="/dashboard"
                className="mt-5 flex items-center justify-center gap-2.5 bg-[#d4af37] py-3.5 font-serif text-base italic tracking-[0.04em] text-[#1b3622]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
