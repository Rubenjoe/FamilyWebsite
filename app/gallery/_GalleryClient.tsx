"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Images,
  Landmark,
  LayoutGrid,
  MapPin,
  X,
} from "lucide-react";

const NORELL_EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT_CATEGORY_ORDER = ["Historic", "Event", "Outing", "Archive"];

/* Album glyph map — echoes the icon-led section headers used on the Events page. */
const ALBUM_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
{
  Everything: LayoutGrid,
  Historic: Landmark,
  Event: CalendarDays,
  Outing: MapPin,
  Archive: Archive,
};

function AlbumGlyph({
  album,
  className,
}: {
  album: string;
  className?: string;
}) {
  const Icon = ALBUM_ICONS[album] ?? Images;
  return <Icon className={className} aria-hidden />;
}

export interface GalleryItemView {
  id: string;
  album: string | null;
  imageUrl: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Everything");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  /* ── Facet: family branches ─────────────────────────────────────────── */
  const branches = useMemo(() => {
    const values = new Set<string>();
    for (const item of items) {
      if (item.branch) values.add(item.branch);
    }
    return ["All Branches", ...Array.from(values).sort()];
  }, [items]);

  /* ── Facet: album categories, ranked by the canonical order ─────────── */
  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const item of items) {
      values.add(item.album?.trim() || "Archive");
    }
    const ranked = Array.from(values).sort((a, b) => {
      const rankA = DEFAULT_CATEGORY_ORDER.indexOf(a);
      const rankB = DEFAULT_CATEGORY_ORDER.indexOf(b);
      if (rankA !== -1 && rankB !== -1) return rankA - rankB;
      if (rankA !== -1) return -1;
      if (rankB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ["Everything", ...ranked];
  }, [items]);

  /* Items after the branch facet — feeds the category counts. */
  const branchFiltered = useMemo(
    () =>
      selectedBranch === "All Branches"
        ? items
        : items.filter((item) => item.branch === selectedBranch),
    [items, selectedBranch]
  );

  /* Items after the category facet — feeds the branch counts. */
  const categoryFiltered = useMemo(
    () =>
      selectedCategory === "Everything"
        ? branchFiltered
        : branchFiltered.filter(
          (item) => (item.album?.trim() || "Archive") === selectedCategory
        ),
    [branchFiltered, selectedCategory]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of branchFiltered) {
      const key = item.album?.trim() || "Archive";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [branchFiltered]);

  const branchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const album = item.album?.trim() || "Archive";
      const categoryOk =
        selectedCategory === "Everything" || album === selectedCategory;
      if (!categoryOk) continue;
      const key = item.branch || "Unspecified Branch";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [items, selectedCategory]);

  const allBranchCount = useMemo(
    () =>
      selectedCategory === "Everything"
        ? items.length
        : items.filter(
          (item) =>
            (item.album?.trim() || "Archive") === selectedCategory
        ).length,
    [items, selectedCategory]
  );

  const totalAlbums = useMemo(() => {
    const values = new Set<string>();
    for (const item of items) {
      values.add(item.album?.trim() || "Archive");
    }
    return values.size;
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, GalleryItemView[]>();
    for (const item of categoryFiltered) {
      const key = item.album?.trim() || "Archive";
      const list = groups.get(key) || [];
      list.push(item);
      groups.set(key, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => {
        const orderA = a.sort_order ?? 0;
        const orderB = b.sort_order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
    }

    return Array.from(groups.entries()).sort(([a], [b]) => {
      const rankA = DEFAULT_CATEGORY_ORDER.indexOf(a);
      const rankB = DEFAULT_CATEGORY_ORDER.indexOf(b);
      if (rankA !== -1 && rankB !== -1) return rankA - rankB;
      if (rankA !== -1) return -1;
      if (rankB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [categoryFiltered]);

  /* Flat ordering of everything currently visible — drives viewer navigation. */
  const flatVisible = useMemo(
    () => groupedItems.flatMap(([, list]) => list),
    [groupedItems]
  );

  const globalIndexById = useMemo(() => {
    const map = new Map<string, number>();
    flatVisible.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [flatVisible]);

  const isFiltering =
    selectedBranch !== "All Branches" || selectedCategory !== "Everything";

  /* Close the viewer whenever the visible set changes (either facet). */
  useEffect(() => {
    setLightboxIndex(null);
  }, [selectedBranch, selectedCategory]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const openLightbox = useCallback((index: number) => {
    setDirection(0);
    setLightboxIndex(index);
  }, []);

  const goTo = useCallback(
    (offset: 1 | -1) => {
      if (lightboxIndex === null || flatVisible.length === 0) return;
      const total = flatVisible.length;
      setDirection(offset);
      setLightboxIndex((lightboxIndex + offset + total) % total);
    },
    [lightboxIndex, flatVisible.length]
  );

  /* Keyboard navigation while the viewer is open. */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, closeLightbox, goTo]);

  /* Lock page scroll behind the viewer. */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxIndex]);

  /* Silently warm the neighbouring full-size images. */
  useEffect(() => {
    if (lightboxIndex === null || flatVisible.length === 0) return;
    const total = flatVisible.length;
    const neighbours = [
      (lightboxIndex + 1) % total,
      (lightboxIndex - 1 + total) % total,
    ];
    for (const index of neighbours) {
      const neighbour = flatVisible[index];
      const url = neighbour?.fullImageUrl || neighbour?.imageUrl;
      if (url && typeof window !== "undefined") {
        const img = new window.Image();
        img.src = url;
      }
    }
  }, [lightboxIndex, flatVisible]);

  const currentItem =
    lightboxIndex !== null && lightboxIndex < flatVisible.length
      ? flatVisible[lightboxIndex]
      : undefined;

  const currentMeta = currentItem
    ? ([currentItem.year, currentItem.branch, currentItem.album?.trim()].filter(
      Boolean
    ) as string[])
    : [];

  const resetFilters = useCallback(() => {
    setSelectedBranch("All Branches");
    setSelectedCategory("Everything");
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf9f4]">
      {/* ── Page header — matches the white band used on the Events page ── */}
      <div className="border-b border-[#1b3622]/10 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
          <div className="animate-fade-up space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a57f12]">
              The Media Vault
            </span>
            <h1 className="font-serif text-2xl font-light tracking-tight text-[#1b3622] sm:text-3xl">
              Photographic Archive
            </h1>
            <div className="h-0.5 w-16 bg-[#d4af37]" aria-hidden />
            <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
              {items.length} photographs · {totalAlbums}{" "}
              {totalAlbums === 1 ? "album" : "albums"}
              {isFiltering && (
                <>
                  {" "}
                  · <span className="text-[#a57f12]">
                    {flatVisible.length} shown
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky curator toolbar — filters sit BELOW the archive title ── */}
      {items.length > 0 && (
        <div className="sticky top-[4.5rem] z-30 border-b border-[#1b3622]/10 bg-[#fbf9f4]/95 shadow-[0_1px_20px_rgba(27,54,34,0.04)] backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6, ease: NORELL_EASE }}
            className="mx-auto max-w-[1600px] space-y-2.5 px-4 py-3.5 sm:px-6"
          >
            {/* Collection selector — “Everything”, or one album at a time */}
            <div className="flex items-center gap-3">
              <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 lg:block">
                Show
              </span>
              <div
                role="group"
                aria-label="Choose which albums to view"
                className="snap-x flex flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((category, index) => {
                  const isActive = selectedCategory === category;
                  const count =
                    category === "Everything"
                      ? branchFiltered.length
                      : categoryCounts.get(category) ?? 0;
                  return (
                    <motion.button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      aria-pressed={isActive}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index, 8) * 0.045,
                        ease: NORELL_EASE,
                      }}
                      className={`relative shrink-0 cursor-pointer whitespace-nowrap snap-start rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 sm:px-4 sm:py-2 ${isActive
                          ? "border-[#1b3622] text-[#fbf9f4]"
                          : "border-[#1b3622]/15 bg-white text-gray-500 hover:border-[#1b3622]/40 hover:text-[#1b3622]"
                        }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="gallery-category-pill"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-[#1b3622] shadow-md"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <AlbumGlyph
                          album={category}
                          className={`h-3 w-3 ${isActive ? "text-[#d4af37]" : "text-[#a57f12]/70"
                            }`}
                        />
                        {category}
                        <span
                          className={`font-mono text-[9px] ${isActive ? "text-[#d4af37]" : "text-gray-400"
                            }`}
                        >
                          {count}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Family branch selector — full width, beneath the title */}
            <div className="flex items-center gap-3">
              <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 lg:block">
                Family Branch
              </span>
              <div
                role="group"
                aria-label="Filter by family branch"
                className="snap-x flex flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {branches.map((branch, index) => {
                  const isActive = selectedBranch === branch;
                  const count =
                    branch === "All Branches"
                      ? allBranchCount
                      : branchCounts.get(branch) ?? 0;
                  return (
                    <motion.button
                      key={branch}
                      type="button"
                      onClick={() => setSelectedBranch(branch)}
                      aria-pressed={isActive}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{
                        duration: 0.45,
                        delay: 0.08 + Math.min(index, 8) * 0.045,
                        ease: NORELL_EASE,
                      }}
                      className={`relative shrink-0 cursor-pointer whitespace-nowrap snap-start rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 sm:px-4 sm:py-2 ${isActive
                          ? "border-[#1b3622] text-[#fbf9f4]"
                          : "border-[#1b3622]/15 bg-white text-gray-500 hover:border-[#1b3622]/40 hover:text-[#1b3622]"
                        }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="gallery-branch-pill"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-[#1b3622] shadow-md"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {branch}
                        <span
                          className={`font-mono text-[9px] ${isActive ? "text-[#d4af37]" : "text-gray-400"
                            }`}
                        >
                          {count}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gallery Content */}
      <div className="mx-auto max-w-[1600px] px-1.5 py-4 sm:px-4 sm:py-8">
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-sm border border-dashed border-[#1b3622]/15 bg-white/60 px-8 py-16 text-center">
            <ImageIcon className="mx-auto h-8 w-8 stroke-[1] text-[#d4af37]/40" />
            <p className="mt-3 text-sm font-light italic leading-relaxed text-gray-400">
              No photographs have been added to the archive yet.
            </p>
          </div>
        ) : groupedItems.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedBranch}-${selectedCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: NORELL_EASE }}
              className="space-y-10 sm:space-y-14"
            >
              {groupedItems.map(([album, groupItems], albumIndex) => (
                <motion.section
                  key={album}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.6,
                    delay: albumIndex * 0.1,
                    ease: NORELL_EASE,
                  }}
                >
                  {/* Album Header — same pattern as the Events page sections */}
                  <div className="mb-3 flex items-center gap-2.5 border-b border-[#1b3622]/10 px-1 pb-3 sm:mb-4 sm:gap-3 sm:px-2">
                    <AlbumGlyph
                      album={album}
                      className="h-4 w-4 shrink-0 text-[#d4af37] sm:h-5 sm:w-5"
                    />
                    <h2 className="font-serif text-lg font-medium text-[#1b3622] sm:text-xl">
                      {album}
                    </h2>
                    <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 sm:text-[11px]">
                      {groupItems.length}{" "}
                      {groupItems.length === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  {/* Premium Dense Grid (iOS/Google Photos Style) */}
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6">
                    {groupItems.map((item, index) => {
                      const globalIndex = globalIndexById.get(item.id) ?? 0;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{
                            duration: 0.5,
                            delay: Math.min(index, 12) * 0.03,
                            ease: NORELL_EASE,
                          }}
                          className="group relative aspect-square overflow-hidden rounded-md bg-[#1b3622]/5 ring-1 ring-inset ring-transparent transition-all duration-500 group-hover:ring-[#d4af37]/50"
                        >
                          {/* Image */}
                          <button
                            type="button"
                            onClick={() => openLightbox(globalIndex)}
                            aria-label={`View larger photo of ${item.title}`}
                            className="absolute inset-0 block h-full w-full cursor-zoom-in"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-110"
                            />
                          </button>

                          {/* Subtle Hover Overlay (Desktop) */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#102517]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          />

                          {/* Minimal Metadata on Hover */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-2 p-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-3"
                          >
                            <div className="flex items-center gap-1.5 text-white">
                              {item.year && (
                                <Calendar className="h-3 w-3 shrink-0 text-[#d4af37]" />
                              )}
                              <span className="truncate text-[10px] font-medium drop-shadow-md sm:text-xs">
                                {item.year
                                  ? `${item.year} • ${item.title}`
                                  : item.title}
                              </span>
                            </div>
                          </div>

                          {/* Tiny Branch Indicator (Top Right, subtle) */}
                          {item.branch && (
                            <div
                              aria-hidden
                              className="pointer-events-none absolute right-1.5 top-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            >
                              <span className="rounded-sm border border-[#d4af37]/40 bg-[#fbf9f4]/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1b3622] shadow-sm backdrop-blur-sm">
                                {item.branch.split(" ")[0]}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="mx-auto max-w-xl rounded-sm border border-dashed border-[#1b3622]/15 bg-white/60 px-8 py-16 text-center">
            <Images className="mx-auto h-8 w-8 stroke-[1] text-[#d4af37]/40" />
            <p className="mt-3 text-sm font-light italic leading-relaxed text-gray-400">
              No media items match this combination of album and branch yet.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 cursor-pointer border-b border-[#1b3622]/20 pb-0.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#1b3622]/60 transition-colors duration-300 hover:border-[#1b3622] hover:text-[#1b3622]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Minimal Footer Accent */}
      <div className="mt-8 border-t border-[#1b3622]/5 py-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 px-6 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <div className="h-px w-6 bg-[#d4af37]/50" />
          <span>Pulazhiyil Heritage Registry</span>
          <div className="h-px w-6 bg-[#d4af37]/50" />
        </div>
      </div>

      {/* ── Immersive photograph viewer (Google Photos style) ─────────────── */}
      <AnimatePresence>
        {currentItem && lightboxIndex !== null && (
          <motion.div
            key="gallery-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`Viewing ${currentItem.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex select-none flex-col bg-[#102517]/95 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-4 sm:px-6"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="font-mono text-xs tracking-[0.25em] text-[#fbf9f4]/60">
                {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
                {String(flatVisible.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close photo viewer"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white text-[#1b3622] shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#d4af37] focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stage */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 sm:px-24">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: direction * 28, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: NORELL_EASE }}
                className="flex max-h-full max-w-full items-center justify-center"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  src={currentItem.fullImageUrl || currentItem.imageUrl}
                  alt={currentItem.title}
                  decoding="async"
                  className="max-h-[68dvh] w-auto max-w-full rounded-sm object-contain shadow-2xl sm:max-h-[72dvh]"
                />
              </motion.div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(-1);
                }}
                aria-label="Previous photograph"
                className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 text-[#fbf9f4] backdrop-blur-sm transition-all duration-300 hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1b3622] sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(1);
                }}
                aria-label="Next photograph"
                className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 text-[#fbf9f4] backdrop-blur-sm transition-all duration-300 hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1b3622] sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Caption card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: NORELL_EASE }}
              className="mx-auto mb-5 w-[min(92%,42rem)] rounded-sm bg-[#fbf9f4] px-5 py-4 text-center shadow-2xl sm:px-7 sm:py-5"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="font-serif text-lg leading-snug text-[#1b3622] sm:text-xl">
                {currentItem.title}
              </h3>
              {currentMeta.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a57f12]">
                  {currentMeta.map((part, index) => (
                    <span
                      key={`${part}-${index}`}
                      className="flex items-center gap-2.5"
                    >
                      {index > 0 && (
                        <span
                          aria-hidden
                          className="h-px w-3 bg-[#a57f12]/40"
                        />
                      )}
                      {part}
                    </span>
                  ))}
                </div>
              )}
              {currentItem.description && (
                <p className="mt-2.5 line-clamp-2 text-[13px] font-light leading-relaxed text-gray-500">
                  {currentItem.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}