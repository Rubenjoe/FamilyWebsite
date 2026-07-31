"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Menu, X } from "lucide-react";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "History", href: "/history" },
    { label: "Family Tree", href: "/tree" },
    { label: "Executive Committee", href: "/members" },
    { label: "Obituary", href: "/obituary" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close the mobile menu on route change so it never gets left open
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-[#1b3622]/10 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${isScrolled ? "shadow-sm" : ""
                }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
                            പുലഴിയിയിൽ കുടുംബയോഗം
                        </span>
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center lg:flex">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ${isActive ? "text-[#1b3622]" : "text-[#1b3622]/65 hover:text-[#1b3622]"
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
                </nav>

                {/* Dashboard button (desktop) */}
                <Link
                    href="/dashboard"
                    className="hidden items-center gap-2 bg-[#1b3622] px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#f8f4e9] transition-colors duration-200 hover:bg-[#234a2c] lg:flex"
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
                        <nav className="flex flex-col px-6 py-4">
                            {NAV_LINKS.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`border-b border-white/10 py-3.5 font-mono text-xs font-bold uppercase tracking-widest last:border-b-0 ${isActive ? "text-[#d4af37]" : "text-[#fbf9f4]/85"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <Link
                                href="/dashboard"
                                className="mt-5 flex items-center justify-center gap-2.5 bg-[#d4af37] py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-[#1b3622]"
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