import { Loader2 } from "lucide-react";

type LoaderVariant = "list" | "grid" | "rows" | "tree";

/**
 * Shared branded loading surface for route-level `loading.tsx` files. Renders
 * inside the layout (navbar + footer stay put) so a navigation never blanks
 * the page — it swaps to a shimmer that matches the destination's shape.
 */
export default function PageLoader({
  label = "Opening the archive",
  variant = "list",
}: {
  label?: string;
  variant?: LoaderVariant;
}) {
  return (
    <div
      className="min-h-[70vh] bg-[#fbf9f4] px-4 py-10 sm:px-6 sm:py-14"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Brand + gold rule */}
        <div className="flex items-center gap-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d4af37]" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#1b3622]/45">
            {label}
          </span>
          <span className="h-px flex-1 overflow-hidden bg-[#1b3622]/10">
            <span className="app-preloader__line block h-px w-full bg-[#d4af37]/50" />
          </span>
        </div>

        {variant === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="skeleton aspect-square rounded-md" />
            ))}
          </div>
        ) : variant === "rows" ? (
          <div className="space-y-4">
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
        ) : variant === "tree" ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="skeleton h-16 w-48 rounded-lg sm:w-56" />
            <div className="h-8 w-px bg-[#1b3622]/10" />
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="skeleton h-14 w-36 rounded-lg" />
              ))}
            </div>
            <div className="h-8 w-px bg-[#1b3622]/10" />
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="skeleton h-14 w-32 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
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
                  <div className="skeleton mb-4 aspect-[4/3] w-full rounded-sm" />
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
