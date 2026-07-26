"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, Menu, X, ChevronRight } from "lucide-react";

// ─── Navigation Configuration ──────────────────────────────────────────────
const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "History", href: "/history" },
    { label: "Family Tree", href: "/tree" },
    { label: "Executive Committee", href: "/members" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" }
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Monitor scroll progression to transform the header layer dynamically
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled
                ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#1b3622]/10 py-2"
                : "bg-white border-b border-[#1b3622]/10 py-3"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

                {/* ── LOGO BRANDING AREA ────────────────────────────────────────── */}
                <Link href="/" className="group cursor-pointer select-none">
                    <img
                        src="/images/logo.png"
                        alt="Pullazhiyil Kudumbayogam"
                        className="h-12 md:h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
                    />
                </Link>

                {/* ── DESKTOP NAVIGATION LINKS ──────────────────────────────────── */}
                <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-3 py-2 text-[11px] xl:text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-300 font-mono ${isActive ? "text-[#1b3622]" : "text-[#1b3622]/50 hover:text-[#1b3622]"
                                    }`}
                            >
                                <span className="relative z-10">{link.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="navbarActiveUnderline"
                                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#d4af37]"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── RIGHT CONTROLS & LUXURY DASHBOARD BUTTON ──────────────────── */}
                <div className="hidden lg:flex items-center space-x-5">
                    {/* Elegant Search Link */}
                    <Link
                        href="/search"
                        className="flex items-center gap-2 text-[#1b3622]/50 hover:text-[#1b3622] transition-colors duration-300 text-[11px] uppercase tracking-[0.15em] font-mono font-semibold"
                    >
                        <Search className="h-3.5 w-3.5 stroke-[2]" />
                        <span>Search</span>
                    </Link>

                    {/* Aesthetic Divider Pipe */}
                    <span className="h-4 w-px bg-[#1b3622]/15" aria-hidden="true" />

                    {/* Premium Dashboard Action Button */}
                    <Link href="/dashboard" className="relative group overflow-hidden block">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative z-10 flex items-center gap-2.5 bg-[#d4af37] text-[#1b3622] text-[11px] uppercase tracking-[0.25em] font-bold px-5 py-3 rounded-none shadow-md transition-shadow duration-500 group-hover:shadow-xl"
                        >
                            <LayoutDashboard className="h-3.5 w-3.5 text-[#1b3622] transition-transform duration-500 group-hover:rotate-12" />
                            <span>Dashboard</span>
                            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-[#1b3622]" />

                            {/* Inner Gold Border Glow Accent */}
                            <div className="absolute inset-0.5 border border-[#1b3622]/10 pointer-events-none group-hover:border-[#1b3622]/30 transition-colors duration-500" />
                        </motion.div>

                        {/* Shimmer / Gloss Sweeping Hover Animation Background */}
                        <div className="absolute inset-0 bg-[#f0c84f] translate-y-full transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:translate-y-0 z-0" />
                    </Link>
                </div>

                {/* ── MOBILE MENU TOGGLE SYSTEM ─────────────────────────────────── */}
                <div className="flex lg:hidden items-center space-x-4">
                    <Link href="/search" className="text-[#1b3622] p-1">
                        <Search className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-[#1b3622] p-1 transition-transform active:scale-95"
                        aria-label="Toggle Navigation Menu"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

            </div>

            {/* ── MOBILE FULL-SCREEN RESPONSIVE OVERLAY MENU ────────────────── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-full left-0 right-0 bg-[#1b3622] border-b border-[#d4af37]/20 shadow-2xl px-6 py-8 flex flex-col space-y-5 lg:hidden max-h-[85vh] overflow-y-auto"
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-xs uppercase tracking-widest font-mono font-bold pb-2 border-b ${pathname === link.href
                                    ? "text-[#d4af37] border-[#d4af37]"
                                    : "text-[#fbf9f4]/70 border-white/10"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Dashboard Button Implementation */}
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-3 bg-[#d4af37] text-[#1b3622] text-xs uppercase tracking-widest font-bold py-4 mt-4 shadow-md"
                        >
                            <LayoutDashboard className="h-4 w-4 text-[#1b3622]" />
                            <span>Dashboard Matrix</span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}