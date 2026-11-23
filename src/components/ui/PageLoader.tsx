import React from "react";
import {
  Bookmark,
  Award,
  Calendar,
  Heart,
  Users,
  Camera,
  GitFork,
  Clock,
} from "lucide-react";

export type LoaderVariant =
  | "list"
  | "grid"
  | "rows"
  | "tree"
  | "history"
  | "achievers"
  | "gallery"
  | "events"
  | "obituary"
  | "members";

const VARIANT_ICONS: Partial<Record<LoaderVariant, React.ComponentType<{ className?: string }>>> = {
  history: Bookmark,
  achievers: Award,
  gallery: Camera,
  events: Calendar,
  obituary: Heart,
  members: Users,
  tree: GitFork,
  rows: Clock,
};

/* Portrait skeleton that echoes the monogram cards it stands in for, so the
   swap from placeholder to real card feels continuous. */
function PortraitSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton skeleton-portrait ${className}`} aria-hidden>
      <span className="skeleton-portrait__mark" />
    </div>
  );
}

/**
 * Shared branded loading surface for route-level `loading.tsx` files. Renders
 * inside the layout (navbar + footer stay put) so a navigation never blanks
 * the page — it renders an elegant, contextual skeleton matching the page's exact structure.
 */
export default function PageLoader({
  label = "Opening the archive",
  variant = "list",
}: {
  label?: string;
  variant?: LoaderVariant;
}) {
  const IconComponent = VARIANT_ICONS[variant];

  return (
    <div
      className="min-h-[75vh] bg-[#fbf9f4] px-4 py-8 sm:px-6 sm:py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
        {/* Brass dial + contextual label + indeterminate hairline */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="loader-ring" aria-hidden>
              {IconComponent ? (
                <IconComponent className="h-3.5 w-3.5 text-[#8a6a0f]" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[#1b3622]/65">
                <span className="loader-label">{label}</span>
              </p>
              <p className="mt-1 truncate text-[9px] font-medium uppercase tracking-[0.2em] text-[#1b3622]/35">
                Pullazhiyil Kudumbayogam · Digital Archive
              </p>
            </div>
            <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a6a0f]/80 sm:block">
              Retrieving records
            </span>
          </div>
          <div className="loader-track" aria-hidden />
        </div>

        {/* ── Variant 1: HISTORY (Editorial timeline blocks) ── */}
        {variant === "history" ? (
          <div className="loader-stagger space-y-16">
            {/* Editorial Header Skeleton */}
            <div className="mx-auto max-w-3xl space-y-4 text-center py-8 border-b border-[#1b3622]/10">
              <div className="skeleton mx-auto h-6 w-40 rounded-full" />
              <div className="skeleton mx-auto h-12 w-3/4 rounded-sm" />
              <div className="skeleton mx-auto h-0.5 w-24 rounded" />
              <div className="skeleton mx-auto h-4 w-2/3 rounded" />
            </div>

            {/* Alternating History Chapters */}
            <div className="space-y-16 max-w-6xl mx-auto">
              {/* Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="skeleton h-5 w-28 rounded" />
                  <div className="skeleton h-8 w-2/3 rounded" />
                  <div className="skeleton h-0.5 w-16" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-24 rounded pt-2" />
                </div>
                <div className="lg:col-span-5">
                  <div className="skeleton aspect-[4/3] w-full rounded-sm" />
                </div>
              </div>

              {/* Full-width feature divider skeleton */}
              <div className="w-full space-y-3 pt-6">
                <div className="skeleton h-[280px] sm:h-[400px] w-full rounded-sm" />
                <div className="skeleton mx-auto h-3 w-1/2 rounded" />
              </div>

              {/* Row 2 (Reversed) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <div className="skeleton aspect-[4/3] w-full rounded-sm" />
                </div>
                <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
                  <div className="skeleton h-5 w-28 rounded" />
                  <div className="skeleton h-8 w-2/3 rounded" />
                  <div className="skeleton h-0.5 w-16" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-24 rounded pt-2" />
                </div>
              </div>
            </div>
          </div>
        ) : variant === "achievers" ? (
          /* ── Variant 2: ACHIEVERS (Tabs + filters + portrait cards) ── */
          <div className="loader-stagger space-y-8">
            {/* Tab switch skeleton */}
            <div className="flex gap-2">
              <div className="skeleton h-10 w-36 rounded-sm" />
              <div className="skeleton h-10 w-36 rounded-sm" />
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="skeleton h-10 w-64 rounded-sm" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="skeleton h-8 w-20 rounded-sm" />
                ))}
              </div>
            </div>

            {/* 4-column Portrait Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-white border border-[#1b3622]/10 p-5 space-y-4 rounded-sm">
                  <PortraitSkeleton className="aspect-[3/4] w-full rounded-sm" />
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-3 w-12 rounded" />
                  </div>
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : variant === "gallery" ? (
          /* ── Variant 3: GALLERY (Curator toolbar + dense photo grid) ── */
          <div className="loader-stagger space-y-8">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="skeleton h-3 w-28 rounded" />
              <div className="skeleton h-8 w-60 rounded" />
              <div className="skeleton h-0.5 w-16" />
            </div>

            {/* Curator toolbar pill skeletons */}
            <div className="space-y-3 border-y border-[#1b3622]/10 py-4">
              <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="skeleton h-9 w-28 rounded-full" />
                ))}
              </div>
              <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="skeleton h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>

            {/* Dense grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {Array.from({ length: 18 }, (_, i) => (
                <div key={i} className="skeleton aspect-square rounded-md" />
              ))}
            </div>
          </div>
        ) : variant === "events" ? (
          /* ── Variant 4: EVENTS (Announcements + 2-col date cards) ── */
          <div className="loader-stagger space-y-10">
            <div className="bg-white border-b border-[#1b3622]/10 p-6 space-y-2">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-8 w-72 rounded" />
              <div className="skeleton h-0.5 w-16" />
              <div className="skeleton h-4 w-96 rounded max-w-full" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="skeleton h-5 w-5 rounded-full" />
                <div className="skeleton h-6 w-44 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-white border border-[#1b3622]/10 p-6 space-y-4">
                    <div className="skeleton h-5 w-36 rounded" />
                    <div className="skeleton h-6 w-3/4 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-4 w-32 rounded pt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : variant === "obituary" ? (
          /* ── Variant 5: OBITUARY (Memorial directory cards) ── */
          <div className="loader-stagger space-y-10">
            <div className="mx-auto max-w-3xl space-y-4 text-center py-6 border-b border-[#1b3622]/10">
              <div className="skeleton mx-auto h-6 w-44 rounded-full" />
              <div className="skeleton mx-auto h-10 w-2/3 rounded-sm" />
              <div className="skeleton mx-auto h-0.5 w-20 rounded" />
              <div className="skeleton mx-auto h-4 w-3/4 rounded" />
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="skeleton h-9 w-28 rounded-sm" />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white border border-[#1b3622]/10 p-6 space-y-5 rounded-sm">
                  <PortraitSkeleton className="mx-auto aspect-[3/4] w-[180px] rounded-sm" />
                  <div className="skeleton mx-auto h-5 w-40 rounded" />
                  <div className="skeleton mx-auto h-3 w-28 rounded" />
                  <div className="space-y-2 pt-2">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-4/5 rounded" />
                  </div>
                  <div className="skeleton h-12 w-full rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : variant === "members" ? (
          /* ── Variant 6: MEMBERS (Executive committee roster) ── */
          <div className="loader-stagger space-y-8">
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-[#1b3622]/10">
              <div className="space-y-2">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-8 w-60 rounded" />
                <div className="skeleton h-0.5 w-16" />
              </div>
              <div className="skeleton h-11 w-64 rounded-sm" />
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="skeleton h-10 w-24 rounded-sm" />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-white border border-[#1b3622]/10 overflow-hidden rounded-sm space-y-4 p-4">
                  <PortraitSkeleton className="aspect-square w-full rounded-sm" />
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : variant === "tree" ? (
          /* ── Variant 7: TREE (Genealogy canvas skeleton) ── */
          <div className="loader-stagger space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b border-[#1b3622]/10">
              <div className="space-y-2">
                <div className="skeleton h-3 w-36 rounded" />
                <div className="skeleton h-8 w-72 rounded" />
                <div className="skeleton h-4 w-80 rounded max-w-full" />
              </div>
              <div className="skeleton h-11 w-72 rounded-full" />
            </div>

            <div className="relative min-h-[500px] border border-[#1b3622]/10 bg-white/60 p-8 rounded-sm flex flex-col items-center justify-center gap-6 overflow-hidden">
              {/* Floating controls skeleton */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="skeleton h-9 w-9 rounded-md" />
                <div className="skeleton h-9 w-9 rounded-md" />
                <div className="skeleton h-9 w-9 rounded-md" />
              </div>

              {/* Tree node hierarchy */}
              <div className="skeleton h-20 w-56 rounded-xl shadow-sm" />
              <div className="h-8 w-0.5 bg-[#1b3622]/15" />
              <div className="flex flex-wrap justify-center gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className="skeleton h-16 w-36 rounded-xl" />
                    <div className="h-6 w-0.5 bg-[#1b3622]/15" />
                    <div className="flex gap-2">
                      <div className="skeleton h-12 w-24 rounded-lg" />
                      <div className="skeleton h-12 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : variant === "rows" ? (
          /* ── Fallback Variant: ROWS ── */
          <div className="loader-stagger space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border border-[#1b3622]/8 bg-white/60 p-5"
              >
                <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2.5">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-2.5 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Fallback Variant: LIST ── */
          <div className="loader-stagger space-y-10">
            <div className="space-y-3">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-8 w-2/3 rounded sm:w-1/2" />
              <div className="skeleton h-2.5 w-full max-w-md rounded" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="border border-[#1b3622]/8 bg-white/60 p-5"
                >
                  <PortraitSkeleton className="mb-4 aspect-[4/3] w-full rounded-sm" />
                  <div className="skeleton mb-2 h-3 w-1/3 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
