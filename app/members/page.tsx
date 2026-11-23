"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MapPin, Search, Users } from "lucide-react";
import LightboxImage from "@/components/ui/LightboxImage";
import InitialsMonogram from "@/components/ui/InitialsMonogram";
import TiltCard from "@/components/ui/TiltCard";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import { HERITAGE_BUCKET, resolveStorageUrl } from "@/utils/storage";

type CommitteeRow = Pick<
  Database["public"]["Tables"]["committee_members"]["Row"],
  "id" | "committee_year" | "name" | "role" | "branch" | "location" | "image_url" | "sort_order"
>;

export default function CommitteePage() {
  const pathname = usePathname();
  const [selectedYear, setSelectedYear] = useState<string>("All Years");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeRow[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("committee_members")
          .select("id,committee_year,name,role,branch,location,image_url,sort_order")
          .eq("is_published", true)
          .order("committee_year", { ascending: false })
          .order("sort_order");

        if (!isCurrent) return;
        if (error) {
          console.error("[Committee] Error loading committee members:", error);
          setLoadError(true);
          return;
        }

        const members = data ?? [];
        setCommitteeMembers(members);
        const years = Array.from(new Set(members.map((member) => member.committee_year))).sort((a, b) => b - a);
        setAvailableYears(years);
        setSelectedYear(years[0]?.toString() ?? "All Years");
      } catch (error: unknown) {
        if (isCurrent) {
          console.error("[Committee] Request failed while loading committee members:", error);
          setLoadError(true);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void fetchData();
    return () => {
      isCurrent = false;
    };
  }, [pathname]);

  const filteredMembers = committeeMembers.filter((member) => {
    const matchesYear = selectedYear === "All Years" || member.committee_year.toString() === selectedYear;
    if (!matchesYear) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      (member.branch && member.branch.toLowerCase().includes(q)) ||
      (member.location && member.location.toLowerCase().includes(q))
    );
  });

  const years = ["All Years", ...availableYears.map(String)];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 sm:space-y-12">
      {/* Header Block Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[#1b3622]/10">
        <div className="space-y-2 animate-fade-up">
          <span className="text-xs uppercase tracking-[0.28em] text-[#8a6a0f] font-semibold block">
            Pullazhiyil Kudumbayogam
          </span>
          <h1 className="text-3xl md:text-5xl text-[#1b3622] font-serif font-light tracking-tight">
            Executive Committee
          </h1>
          <div className="w-16 h-0.5 bg-[#d4af37]" aria-hidden />
        </div>

        {/* Dynamic Controls Grid Shell */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search committee members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-sm tracking-wide focus:outline-none focus:border-[#1b3622] focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 text-[#2d312e] transition-colors min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Interactive Quick Year Filter Row */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        {isLoading && years.length === 1 ? (
          <div className="flex gap-2" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[2.75rem] w-24 animate-pulse rounded-sm bg-gray-100" />
            ))}
          </div>
        ) : (
          years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              aria-pressed={selectedYear === year}
              className={`press-ink flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-sm border px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 ${
                selectedYear === year
                  ? "border-[#1b3622] bg-[#1b3622] text-[#fbf9f4]"
                  : "border-[#1b3622]/15 bg-white text-[#1b3622]/60 hover:border-[#d4af37]/60 hover:text-[#1b3622]"
              }`}
            >
              {year}
            </button>
          ))
        )}
      </div>

      {/* Grid Matrix Layout Pipeline */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8" aria-label="Loading committee members">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div role="alert" className="border border-red-200 bg-white px-6 py-12 text-center text-red-800">
          <p className="font-serif text-lg">Committee records could not be loaded.</p>
          <p className="mt-2 text-sm">Please refresh the page or try again later.</p>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredMembers.map((member, index) => (
            <TiltCard
              key={member.id}
              max={5}
              className="animate-fade-up h-full"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              surfaceClassName="group relative flex h-full flex-col overflow-hidden rounded-sm border border-[#1b3622]/10 bg-white shadow-sm hover:border-[#d4af37]/40 hover:shadow-[0_22px_50px_-24px_rgba(27,54,34,0.45)]"
            >
              {/* Portrait plate */}
              <div className="relative aspect-[4/5] shrink-0 overflow-hidden border-b border-[#1b3622]/8 bg-[#fbf9f4]">
                {member.image_url ? (
                  <LightboxImage
                    src={resolveStorageUrl(HERITAGE_BUCKET, member.image_url)}
                    alt={`${member.name} profile`}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.05]"
                  />
                ) : (
                  <InitialsMonogram name={member.name} />
                )}

                {/* Grounding gradient so the overlays stay legible on any photo */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#102517]/70 via-[#102517]/5 to-transparent"
                />

                {/* Branch chip + committee year, styled like the registry chips */}
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                  <span className="rounded-sm border border-[#1b3622]/10 bg-[#fbf9f4]/95 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#1b3622] shadow-sm">
                    {member.branch || "Unassigned"}
                  </span>
                  <span className="rounded-sm bg-[#102517]/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#fbf9f4] backdrop-blur-[2px]">
                    {member.committee_year}
                  </span>
                </div>

                {/* Filing number, echoing the archive's catalogue style */}
                <span
                  aria-hidden
                  className="absolute bottom-3 left-3 font-serif text-xl italic leading-none text-[#fbf9f4]/75 drop-shadow"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Gold hairline reveal on hover */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[#d4af37] transition-transform duration-500 ease-premium group-hover:scale-x-100"
                />
              </div>

              {/* Record details */}
              <div className="flex flex-grow flex-col gap-3 p-5">
                <div className="space-y-1.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a6a0f]">
                    {member.role}
                  </p>
                  <h3 className="break-words font-serif text-[19px] font-medium leading-snug text-[#1b3622]">
                    {member.name}
                  </h3>
                </div>

                <div className="mt-auto flex items-center gap-2 border-t border-[#1b3622]/10 pt-3 text-[13px] text-[#52584f]">
                  {member.location ? (
                    <>
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8a6a0f]" aria-hidden />
                      <span className="truncate">{member.location}</span>
                    </>
                  ) : (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#1b3622]/35">
                      Location awaited
                    </span>
                  )}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-[#1b3622]/15 bg-white/40 space-y-3">
          <Users className="h-8 w-8 text-[#1b3622]/20 mx-auto" />
          <p className="text-sm text-gray-500 italic">
            {selectedYear === "All Years"
              ? "No committee records are available."
              : `No committee records are available for ${selectedYear}.`}
          </p>
        </div>
      )}
    </div>
  );
}
