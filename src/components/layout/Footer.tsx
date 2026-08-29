import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#1b3622] text-[#fbf9f4]/80 text-sm py-16 px-6 md:px-12 border-t border-[#d4af37]/20 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                {/* Col 1: Core Corporate Branding Statement */}
                <div className="md:col-span-5 space-y-4">
                    <span className="block font-serif text-xl tracking-wide text-[#fbf9f4] font-normal">
                        പുല്ലാഴിയിൽ കുടുംബയോഗം
                    </span>
                    <p className="font-sans text-sm font-normal leading-relaxed max-w-sm">
                        A timeless archive dedicated to tracing, conserving, and celebrating the generational lineage, historical milestones, and shared values of the Pulazhiyil family.
                    </p>
                </div>

                {/* Col 2: Navigation Links Grid Shortcut */}
                <div className="md:col-span-4 space-y-3">
                    <span className="block text-xs uppercase tracking-[0.15em] text-[#d4af37] font-semibold">
                        Quick Navigation Links
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <Link href="/history" className="hover:text-[#d4af37] transition-colors">Chronicles</Link>
                        <Link href="/tree" className="hover:text-[#d4af37] transition-colors">Lineage Graph</Link>
                        <Link href="/members" className="hover:text-[#d4af37] transition-colors">Registry Directory</Link>
                        <Link href="/gallery" className="hover:text-[#d4af37] transition-colors">Photo Vault</Link>
                        <Link href="/timeline" className="hover:text-[#d4af37] transition-colors">Milestones</Link>
                        <Link href="/admin" className="hover:text-[#d4af37] transition-colors">Management</Link>
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
