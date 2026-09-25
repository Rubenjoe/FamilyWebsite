"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Calendar } from "lucide-react";
import LightboxImage from "@/components/ui/LightboxImage";

const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

export interface GalleryItemView {
  id: string;
  album: string | null;
  imageUrl: string;
  /** Higher-resolution source revealed inside the lightbox. */
  fullImageUrl?: string;
  title: string;
  description?: string;
  year?: string;
  branch?: string;
  sort_order?: number;
}

interface GalleryClientProps {
  items: GalleryItemView[];
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");

  const branches = useMemo(() => {
    const values = new Set<string>();
    for (const item of items) {
      if (item.branch) values.add(item.branch);
    }
    return ["All Branches", ...Array.from(values).sort()];
  }, [items]);

  const groupedItems = useMemo(() => {
    const filtered =
      selectedBranch === "All Branches"
        ? items
        : items.filter((item) => item.branch === selectedBranch);

    const groups = new Map<string, GalleryItemView[]>();
    for (const item of filtered) {
      const key = item.branch || "Unspecified Branch";
      const list = groups.get(key) || [];
      list.push(item);
      groups.set(key, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => {
        const orderA = a.sort_order ?? 0;
        const orderB = b.sort_order ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.title.localeCompare(b.title);
      });
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items, selectedBranch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 sm:space-y-12 relative z-10">
      <div className="space-y-2 border-b border-gray-100 pb-6 animate-fade-up">
        <span className="text-xs uppercase tracking-[0.28em] text-[#a57f12] font-semibold block">
          The Media Vault
        </span>
        <h1 className="text-3xl md:text-5xl text-[#1b3622] font-serif font-light tracking-tight">
          Historical Photographic Archive
        </h1>
        <div className="w-16 h-0.5 bg-[#d4af37]" aria-hidden />
      </div>

      {items.length > 0 && (
        <div className="space-y-3 pb-2 border-b border-gray-100">
          <span className="text-xs uppercase tracking-[0.15em] text-[#a57f12] font-bold block">
            Filter by Family Branch
          </span>
          <div className="flex flex-wrap gap-2">
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => setSelectedBranch(branch)}
                aria-pressed={selectedBranch === branch}
                className={`min-h-[44px] px-4 py-2 text-xs uppercase tracking-[0.1em] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center ${
                  selectedBranch === branch
                    ? "bg-[#1b3622] text-[#fbf9f4] font-semibold shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-[#1b3622]/30 hover:text-[#1b3622]"
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#1b3622]/15 bg-white/40 space-y-3">
          <ImageIcon className="h-8 w-8 text-[#1b3622]/20 mx-auto" />
          <p className="text-sm text-gray-500 italic">
            No photographs have been added to the archive yet.
          </p>
        </div>
      ) : groupedItems.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedBranch}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: NORELL_EASE }}
            className="space-y-12"
          >
            {groupedItems.map(([branch, groupItems]) => (
              <section key={branch} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <h2 className="text-xl font-serif text-[#1b3622]">{branch}</h2>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    {groupItems.length} photo{groupItems.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {groupItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, delay: Math.min(index, 4) * 0.08, ease: NORELL_EASE }}
                      className="bg-white border border-[#1b3622]/10 shadow-sm rounded-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-[0_16px_40px_rgba(27,54,34,0.10)] hover:border-[#d4af37]/30 transition-all duration-500 ease-premium"
                    >
                      <div className="w-full md:w-1/2 aspect-video md:aspect-square relative overflow-hidden bg-gray-50 shrink-0">
                        <LightboxImage
                          src={item.imageUrl}
                          fullSrc={item.fullImageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                        />
                      </div>

                      <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.album && (
                              <span className="bg-[#1b3622]/5 text-[#1b3622] text-xs uppercase tracking-[0.1em] font-bold px-2 py-1 border border-[#1b3622]/10">
                                {item.album}
                              </span>
                            )}
                            {item.year && (
                              <span className="text-[#a57f12] font-mono text-sm font-semibold flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {item.year}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg text-[#2d312e] font-serif font-medium leading-snug break-words">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 font-light leading-relaxed break-words">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="text-[11px] uppercase tracking-[0.12em] text-[#a57f12] font-semibold pt-2 border-t border-gray-100">
                          Pulazhiyil Heritage Registry
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-16 border border-dashed border-[#1b3622]/15 bg-white/40 space-y-3">
          <ImageIcon className="h-8 w-8 text-[#1b3622]/20 mx-auto" />
          <p className="text-sm text-gray-500 italic">
            No media items cataloged under this branch yet.
          </p>
        </div>
      )}
    </div>
  );
}
