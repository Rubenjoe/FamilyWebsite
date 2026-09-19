import Link from "next/link";

const FOOTER_LINKS = [
    { label: "Chronicles", href: "/history" },
    { label: "Lineage Graph", href: "/tree" },
    { label: "Registry Directory", href: "/members" },
    { label: "Photo Vault", href: "/gallery" },
    { label: "Milestones", href: "/events" },
    { label: "Management", href: "/admin" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#1b3622] text-[#fbf9f4]/80 text-sm py-16 px-6 md:px-12 border-t border-[#d4af37]/20 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                {/* Col 1: Core Corporate Branding Statement */}
                <div className="md:col-span-5 space-y-4">
                    <span className="Malayalam-font block font-serif text-xl tracking-wide text-[#fbf9f4] font-normal">
                        പുല്ലാഴിയിൽ കുടുംബയോഗം
                    </span>
                    <div className="w-10 h-px bg-[#d4af37]/50" aria-hidden />
                    <p className="font-sans text-sm font-normal leading-relaxed max-w-sm">
                        A timeless archive dedicated to tracing, conserving, and celebrating the generational lineage, historical milestones, and shared values of the Pulazhiyil family.
                    </p>
                </div>

                {/* Col 2: Navigation Links Grid Shortcut */}
                <div className="md:col-span-4 space-y-3">
                    <span className="block text-xs uppercase tracking-[0.15em] text-[#d4af37] font-semibold">
                        Quick Navigation Links
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {FOOTER_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group relative w-fit py-1.5 transition-colors duration-300 hover:text-[#d4af37]"
                            >
                                {link.label}
                                <span
                                    aria-hidden
                                    className="absolute bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#d4af37]/60 transition-transform duration-300 ease-premium group-hover:scale-x-100"
                                />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Col 3: Legal Integrity Footer Note */}
                <div className="md:col-span-3 space-y-3 md:text-right">
                    <span className="block text-xs uppercase tracking-[0.15em] text-[#d4af37] font-semibold">
                        Archive Maintenance
                    </span>
                    <p className="text-sm font-mono leading-relaxed">
                        Est. 1924 <br />
                        Digital Edition &copy; {currentYear}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#fbf9f4]/10 text-center md:text-left text-sm font-normal tracking-wide">
                Handcrafted to stand immutable across generations. Optimized for long-term historical retention.
            </div>
        </footer>
    );
}
