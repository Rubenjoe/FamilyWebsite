"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Users, Search, X } from "lucide-react";
import LightboxImage from "@/components/ui/LightboxImage";
import InitialsMonogram from "@/components/ui/InitialsMonogram";
import { withCloudinaryTransform } from "@/utils/storage";
import type { Database } from "@/types/supabase";

const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

type HeritageRow = Pick<
  Database["public"]["Tables"]["heritage_records"]["Row"],
  "id" | "name" | "branch" | "title" | "description" | "image_url" | "year_label"
>;

type Tab = "achievers" | "evangelists";
type RecordItem = {
  id: string;
  name: string;
  branch: string;
  title: string;
  description: string;
  image: string;
  year: string;
};

function toRecordItem(row: HeritageRow): RecordItem {
  return {
    id: row.id,
    name: row.name,
    branch: row.branch,
    title: row.title ?? "",
    description: row.description ?? "",
    image: row.image_url ?? "",
    year: row.year_label ?? "",
  };
}

function matchesFilters(record: RecordItem, query: string, branch: string) {
  if (branch !== "All" && record.branch !== branch) return false;
  if (!query) return true;
  const haystack = [record.name, record.title, record.branch, record.description]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default function AchieversClient({
  achievers,
  evangelists,
  initialTab,
}: {
  achievers: HeritageRow[];
  evangelists: HeritageRow[];
  initialTab: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("All");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const records = useMemo(
    () => ({
      achievers: achievers.map(toRecordItem),
      evangelists: evangelists.map(toRecordItem),
    }),
    [achievers, evangelists]
  );

  const allItems =
    activeTab === "achievers" ? records.achievers : records.evangelists;

  const branches = useMemo(
    () => ["All", ...Array.from(new Set(allItems.map((r) => r.branch))).sort()],
    [allItems]
  );

  const items = useMemo(
    () => allItems.filter((record) => matchesFilters(record, query, branch)),
    [allItems, query, branch]
  );

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setBranch("All");
    // Keep the URL in sync without triggering a server re-render.
    window.history.replaceState(null, "", tab === "achievers" ? "/achievers" : "/achievers?tab=evangelists");
  };

  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const tabs: Tab[] = ["achievers", "evangelists"];
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (nextIndex === null) return;
    event.preventDefault();
    switchTab(tabs[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  const isFiltering = query !== "" || branch !== "All";

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-12">
      {/* ── Tab switcher (proper tablist semantics) ── */}
      <div
        role="tablist"
        aria-label="Registry categories"
        className="flex gap-0 border border-[#1b3622]/15 w-fit"
      >
        {(["achievers", "evangelists"] as Tab[]).map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`tab-${tab}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => switchTab(tab)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`relative px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold transition-colors duration-300 cursor-pointer ${
                isActive
                  ? "text-[#fbf9f4]"
                  : "text-[#1b3622]/60 hover:text-[#1b3622]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="achieverTabIndicator"
                  className="absolute inset-0 bg-[#1b3622]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {tab === "achievers" ? (
                  <Award className="h-3 w-3" />
                ) : (
                  <Users className="h-3 w-3" />
                )}
                {tab === "achievers" ? "Achievers" : "Evangelists"}
                <span className="font-normal opacity-70">
                  ({tab === "achievers" ? records.achievers.length : records.evangelists.length})
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="w-full h-px bg-[#1b3622]/10 mt-8 mb-10" />

      {/* ── Search + branch filter ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-12">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1b3622]/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, title, or branch…"
            aria-label="Search the registry"
            className="w-full bg-white border border-[#1b3622]/15 pl-9 pr-9 py-2.5 text-sm text-[#1b3622] placeholder:text-[#1b3622]/35 focus:outline-none focus:border-[#d4af37] transition-colors duration-300 rounded-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1b3622]/40 hover:text-[#1b3622] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by branch"
        >
          {branches.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setBranch(name)}
              aria-pressed={branch === name}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-mono font-bold border transition-colors duration-300 cursor-pointer rounded-sm ${
                branch === name
                  ? "bg-[#1b3622] text-[#fbf9f4] border-[#1b3622]"
                  : "bg-white/60 text-[#1b3622]/60 border-[#1b3622]/15 hover:border-[#1b3622]/40 hover:text-[#1b3622]"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {isFiltering && (
          <p className="text-xs font-mono text-gray-400 tracking-wide md:ml-auto">
            {items.length} of {allItems.length} shown
          </p>
        )}
      </div>

      {/* ── Grid ── */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: NORELL_EASE }}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ${items.length > 0 ? "pb-32" : "pb-0"}`}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: Math.min(index, 7) * 0.09,
                  ease: NORELL_EASE,
                }}
                className="bg-white border border-[#1b3622]/10 p-6 flex flex-col justify-between space-y-5 shadow-sm group hover:shadow-[0_16px_40px_rgba(27,54,34,0.10)] hover:border-[#d4af37]/30 hover:-translate-y-1 transition-all duration-500 ease-premium rounded-sm"
              >
                {/* Photo frame */}
                <div className="aspect-[3/4] w-full bg-[#fbf9f4] border border-dashed border-[#1b3622]/20 flex flex-col items-center justify-center text-center relative overflow-hidden group-hover:border-[#d4af37]/45 transition-colors duration-500 rounded-sm">
                  {item.image ? (
                    <LightboxImage
                      src={withCloudinaryTransform(item.image, 600)}
                      alt={item.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <InitialsMonogram name={item.name} />
                  )}
                  {/* Corner decorations */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#1b3622]/20" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#1b3622]/20" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#1b3622]/20" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#1b3622]/20" />
                </div>

                {/* Info */}
                <div className="space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-[#1b3622]/5 text-[#1b3622] text-xs uppercase tracking-[0.1em] font-bold px-2 py-1 border border-[#1b3622]/10">
                        {item.branch} Branch
                      </span>
                      <span className="text-gray-500 font-mono text-xs tracking-wide">
                        {item.year}
                      </span>
                    </div>
                    <h3 className="text-xl text-[#1b3622] font-serif font-medium leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-sm uppercase tracking-[0.1em] text-[#a57f12] font-semibold font-mono">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 pt-3 border-t border-gray-100">
                    Pulazhiyil Excellence Registry
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Filtered empty state — distinct from an empty registry */}
        {allItems.length > 0 && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: NORELL_EASE }}
            className="mt-0 pb-32 w-full border border-dashed border-[#1b3622]/15 bg-white/60 rounded-sm px-8 py-14 flex flex-col items-center justify-center text-center gap-3"
          >
            <Search className="h-8 w-8 text-[#d4af37]/40 stroke-[1]" />
            <p className="text-sm text-gray-400 font-light italic leading-relaxed max-w-xs">
              No records match your search or branch filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setBranch("All");
              }}
              className="text-xs uppercase tracking-[0.15em] font-mono font-bold text-[#1b3622]/60 hover:text-[#1b3622] border-b border-[#1b3622]/20 hover:border-[#1b3622] pb-0.5 transition-colors duration-300 cursor-pointer"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Registry itself is empty */}
        {allItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: NORELL_EASE }}
            className="mt-0 pb-32 w-full border border-dashed border-[#1b3622]/15 bg-white/60 rounded-sm px-8 py-14 flex flex-col items-center justify-center text-center gap-3"
          >
            {activeTab === "achievers" ? (
              <Award className="h-8 w-8 text-[#d4af37]/40 stroke-[1]" />
            ) : (
              <Users className="h-8 w-8 text-[#d4af37]/40 stroke-[1]" />
            )}
            <p className="text-sm text-gray-400 font-light italic leading-relaxed max-w-xs">
              {activeTab === "achievers"
                ? "No family achievements have been published yet."
                : "No family evangelist records have been published yet."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
