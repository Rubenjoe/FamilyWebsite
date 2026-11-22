"use client";

import { useEffect, useRef, useState } from "react";
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

const MOBILE_LINK_EASE = [0.16, 1, 0.3, 1] as const;

/** True for the current route and any nested route beneath it. */
function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  // Hover-to-open only for mouse/trackpad. On touch devices a tap fires
  // pointerenter, which used to leave the dropdown stuck open.
  const canHoverRef = useRef(false);

  useEffect(() => {
    canHoverRef.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close every overlay on route change so it never gets left open
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

  // Escape closes whichever overlay is open and returns focus to its trigger.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isMoreOpen) {
        setIsMoreOpen(false);
        moreButtonRef.current?.focus();
      }
      setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMoreOpen]);

  // Lock the page behind the mobile drawer.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  // The drawer only exists below `lg`; close it if the viewport grows.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      if (query.matches) setIsMobileMenuOpen(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const isMoreActive = MORE_LINKS.some((link) =>
    isCurrentRoute(pathname, link.href)
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[#1b3622]/10 bg-white transition-shadow duration-500 ease-premium ${isScrolled ? "shadow-[0_1px_24px_rgba(27,54,34,0.08)]" : ""}`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group press flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <img
            src="/images/logo.png"
            alt="Pullazhiyil Kudumbayogam"
            className="h-9 w-auto shrink-0 object-contain transition-transform duration-500 ease-premium group-hover:scale-[1.04] sm:h-11 md:h-12"
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="hidden font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#1b3622]/80 transition-colors duration-300 group-hover:text-[#1b3622] sm:block">
              Pullazhiyil
            </span>
            <span className="Malayalam-font whitespace-nowrap text-[clamp(11px,3.6vw,16px)] font-semibold leading-[1.6] text-[#1b3622]">
              പുല്ലാഴിയിൽ കുടുംബയോഗം
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center justify-center gap-1 lg:flex"
        >
          {PRIMARY_LINKS.map((link) => {
            const isActive = isCurrentRoute(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative px-3.5 py-3 font-serif text-[15px] italic tracking-[0.04em] transition-colors duration-300 ${isActive
                  ? "text-[#1b3622]"
                  : "text-[#1b3622]/80 hover:text-[#1b3622]"
                  }`}
              >
                {link.label}
                {isActive ? (
                  <motion.span
                    layoutId="navbarActiveUnderline"
                    className="absolute inset-x-3.5 bottom-0 h-[2px] bg-[#d4af37]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3.5 bottom-0 h-[2px] origin-left scale-x-0 bg-[#d4af37]/70 transition-transform duration-300 ease-premium group-hover:scale-x-100"
                  />
                )}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div
            ref={moreRef}
            className="relative"
            onPointerEnter={() => {
              if (canHoverRef.current) setIsMoreOpen(true);
            }}
            onPointerLeave={() => {
              if (canHoverRef.current) setIsMoreOpen(false);
            }}
          >
            <button
              ref={moreButtonRef}
              id="navbar-more-dropdown"
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className={`group relative flex items-center gap-1.5 px-3.5 py-3 font-serif text-[15px] italic tracking-[0.04em] transition-colors duration-300 ${isMoreActive || isMoreOpen
                ? "text-[#1b3622]"
                : "text-[#1b3622]/80 hover:text-[#1b3622]"
                }`}
              aria-haspopup="true"
              aria-expanded={isMoreOpen}
              aria-controls="navbar-more-panel"
              aria-label="More navigation options"
            >
              <span>More</span>
              <motion.span
                animate={{ rotate: isMoreOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </motion.span>
              {isMoreActive || isMoreOpen ? (
                <motion.span
                  layoutId="navbarActiveUnderline"
                  className="absolute inset-x-3.5 bottom-0 h-[2px] bg-[#d4af37]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3.5 bottom-0 h-[2px] origin-left scale-x-0 bg-[#d4af37]/70 transition-transform duration-300 ease-premium group-hover:scale-x-100"
                />
              )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  id="navbar-more-panel"
                  initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full z-50 mt-1 w-56 origin-top overflow-hidden border border-[#1b3622]/10 bg-white shadow-[0_12px_40px_rgba(27,54,34,0.12)]"
                >
                  {MORE_LINKS.map((link) => {
                    const isActive = isCurrentRoute(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`group flex items-center justify-between border-b border-[#1b3622]/6 px-4 py-3 font-serif text-base italic tracking-[0.03em] transition-colors duration-200 last:border-b-0 ${isActive
                          ? "bg-[#1b3622]/5 text-[#1b3622]"
                          : "text-[#1b3622]/65 hover:bg-[#fbf9f4] hover:text-[#1b3622]"
                          }`}
                      >
                        <span className="transition-transform duration-200 ease-premium group-hover:translate-x-0.5">
                          {link.label}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
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
          className="group press hidden items-center gap-2 bg-[#1b3622] px-5 py-3 font-serif text-base italic tracking-[0.06em] text-[#f8f4e9] transition-colors duration-300 hover:bg-[#234a2c] lg:flex"
        >
          <LayoutDashboard className="h-3.5 w-3.5 transition-transform duration-300 ease-premium group-hover:-rotate-3" />
          Dashboard
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="-mr-2 shrink-0 p-2 text-[#1b3622] transition-transform duration-200 ease-premium active:scale-90 lg:hidden"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: MOBILE_LINK_EASE }}
            className="overflow-hidden border-t border-[#d4af37]/20 bg-[#1b3622] lg:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="flex max-h-[calc(100dvh-4.5rem)] flex-col overflow-y-auto px-6 pb-6 pt-4"
            >
              {ALL_LINKS.map((link, index) => {
                const isActive = isCurrentRoute(pathname, link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.05 + index * 0.04,
                      ease: MOBILE_LINK_EASE,
                    }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between border-b border-white/10 py-3.5 font-serif text-lg italic tracking-[0.04em] transition-colors duration-200 last:border-b-0 ${isActive
                        ? "text-[#d4af37]"
                        : "text-[#fbf9f4]/90 hover:text-[#d4af37]"
                        }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.05 + ALL_LINKS.length * 0.04,
                  ease: MOBILE_LINK_EASE,
                }}
              >
                <Link
                  href="/dashboard"
                  className="press mt-5 flex items-center justify-center gap-2.5 bg-[#d4af37] py-3.5 font-serif text-lg italic tracking-[0.04em] text-[#1b3622] transition-colors duration-300 hover:bg-[#e2c052]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
