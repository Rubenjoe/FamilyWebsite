"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBoxProps {
  initialQuery?: string;
}

export default function SearchBox({ initialQuery = "" }: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);

  // Sync state if URL changes externally
  useEffect(() => {
    const current = searchParams.get("query") || "";
    setQuery(current);
  }, [searchParams]);

  // Debounced URL updates when typing
  useEffect(() => {
    const currentInUrl = searchParams.get("query") || "";
    if (query === currentInUrl) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("query", query.trim());
      } else {
        params.delete("query");
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 280);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("query", query.trim());
    } else {
      params.delete("query");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="group relative flex w-full items-center sm:w-80"
    >
      <div className="pointer-events-none absolute left-3.5 flex items-center text-[#1b3622]/40 transition-colors duration-200 group-focus-within:text-[#b8912e]">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#b8912e]" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClear();
          }
        }}
        placeholder="Locate family member..."
        aria-label="Search family tree members"
        className="h-11 w-full rounded-full border border-[#1b3622]/15 bg-white/90 pl-10 pr-10 text-sm font-medium tracking-wide text-[#1b3622] placeholder-[#1b3622]/40 shadow-[0_2px_12px_rgba(27,54,34,0.04)] backdrop-blur-md transition-all duration-200 hover:border-[#1b3622]/30 focus:border-[#1b3622] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-[#1b3622]/45 transition-all duration-150 hover:bg-[#1b3622]/8 hover:text-[#1b3622] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af37]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
