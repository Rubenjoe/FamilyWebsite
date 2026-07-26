"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Heart, User, Bookmark } from "lucide-react";

interface ObituaryPlaceholder {
    id: string;
    branch: string;
}

const OBITUARY_PLACEHOLDERS: ObituaryPlaceholder[] = [
    { id: "ob1", branch: "Pullazhiyil" },
    { id: "ob2", branch: "Thykurinjiyil" },
    { id: "ob3", branch: "Thanuvelil" },
    { id: "ob4", branch: "Poovathumparambil" },
    { id: "ob5", branch: "Pullazhiyil" },
    { id: "ob6", branch: "Thykurinjiyil" },
];

const FAMILY_BRANCHES = ["All", "Pullazhiyil", "Thykurinjiyil", "Thanuvelil", "Poovathumparambil"];

export default function ObituaryPage() {
    const [selectedBranch, setSelectedBranch] = useState<string>("All");

    const filteredObituaries = OBITUARY_PLACEHOLDERS.filter((item) =>
        selectedBranch === "All" || item.branch === selectedBranch
    );

    const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

    return (
        <div className="bg-[#fbf9f4] bg-parchment text-[#1b3622] min-h-screen pb-24 selection:bg-[#1b3622] selection:text-[#fbf9f4] relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[10%] left-[-15%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#d4af37]/4 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
            <div className="absolute top-[50%] right-[-15%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] rounded-full bg-[#1b3622]/3 blur-[90px] md:blur-[180px] pointer-events-none z-0" />

            {/* Dignified Header */}
            <section className="relative z-10 py-20 px-6 border-b border-[#1b3622]/10 bg-white/40 backdrop-blur-[2px]">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: NORELL_EASE }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-[#1b3622]/5 border border-[#1b3622]/10 rounded-full"
                    >
                        <Bookmark className="h-3.5 w-3.5 text-[#d4af37]" />
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#1b3622] font-semibold font-mono">
                            In Loving Remembrance
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.15, ease: NORELL_EASE }}
                        className="text-4xl md:text-5xl font-light font-serif tracking-tight leading-tight text-[#1b3622]"
                    >
                        Family Obituary Directory
                    </motion.h1>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.4, delay: 0.3, ease: NORELL_EASE }}
                        className="w-24 h-0.5 bg-[#d4af37] mx-auto"
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.45 }}
                        className="text-gray-600 font-light max-w-xl mx-auto text-sm md:text-base leading-relaxed"
                    >
                        Honoring and keeping alive the memories of our beloved family members who have departed from this world. May their souls rest in eternal peace.
                    </motion.p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 mt-12 space-y-10 relative z-10">
                {/* Branch Filters */}
                <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                    {FAMILY_BRANCHES.map((branch) => (
                        <button
                            key={branch}
                            onClick={() => setSelectedBranch(branch)}
                            className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all cursor-pointer ${selectedBranch === branch
                                ? "bg-[#1b3622] text-[#fbf9f4] font-semibold"
                                : "bg-white border border-gray-200 text-gray-500 hover:border-[#1b3622]/30"
                                }`}
                        >
                            {branch} {branch !== "All" ? "Branch" : "Remembrances"}
                        </button>
                    ))}
                </div>

                {/* Obituary Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredObituaries.map((obituary) => (
                            <motion.div
                                layout
                                key={obituary.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: NORELL_EASE }}
                                className="bg-white border border-[#1b3622]/10 p-6 flex flex-col justify-between space-y-6 shadow-sm group hover:shadow-md transition-all duration-500 rounded-sm relative overflow-hidden"
                            >
                                {/* Top gold thin accent line */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#d4af37]/60" />

                                {/* Photo Frame with Silhouette */}
                                <div className="aspect-square w-full max-w-[200px] mx-auto bg-[#fbf9f4] border border-dashed border-[#1b3622]/20 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group-hover:border-[#d4af37]/50 transition-colors duration-500 rounded-full">
                                    <User className="h-12 w-12 text-[#d4af37] stroke-[0.75] mb-2 opacity-60" />
                                    <span className="text-[10px] uppercase tracking-widest font-mono text-[#1b3622]/40 font-bold block">
                                        Photograph
                                    </span>
                                    <span className="text-[9px] text-[#1b3622]/30 font-light block mt-0.5">
                                        Placeholder Box
                                    </span>

                                    {/* Subtle gold concentric ring */}
                                    <div className="absolute inset-2 border border-[#d4af37]/5 rounded-full pointer-events-none" />
                                </div>

                                {/* Content Details */}
                                <div className="space-y-4 flex-grow">
                                    {/* Title Header */}
                                    <div className="text-center space-y-1">
                                        <span className="bg-[#1b3622]/5 text-[#1b3622] text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border border-[#1b3622]/10 inline-block">
                                            {obituary.branch} Branch
                                        </span>
                                        <h3 className="text-xl text-[#1b3622] font-serif font-light pt-2">
                                            Deceased Member Name
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-mono pt-1">
                                            <Calendar className="h-3.5 w-3.5 text-[#d4af37]" />
                                            <span>DD/MM/YYYY</span>
                                            <span className="text-gray-300">—</span>
                                            <span>DD/MM/YYYY</span>
                                        </div>
                                    </div>

                                    {/* Biography placeholder */}
                                    <div className="space-y-2 border-t border-gray-100 pt-3">
                                        <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                            Biography
                                        </h4>
                                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                                            Biography Placeholder — Space dedicated to sharing a brief overview of their life's journey, achievements, character, and legacy within the family.
                                        </p>
                                    </div>

                                    {/* Tribute Message placeholder */}
                                    <div className="space-y-2 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Heart className="h-3.5 w-3.5 text-[#d4af37]" />
                                            <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                                Tribute & Remembrance
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-500 italic font-light leading-relaxed bg-[#fbf9f4] p-3 border-l-2 border-[#d4af37] rounded-r-sm">
                                            Tribute Message Placeholder — Leave a word of prayer, remembrance, or a special memory dedicated to their lifetime.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center text-[9px] font-mono text-gray-400 pt-2 border-t border-gray-100/60">
                                    Pulazhiyil Heritage Registry
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
