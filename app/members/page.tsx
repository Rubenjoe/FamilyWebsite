"use client";

import { useEffect, useState } from "react";
import { MapPin, Search, Users } from "lucide-react";
import LightboxImage from "@/components/ui/LightboxImage";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";

type CommitteeRow = Database["public"]["Tables"]["committee_members"]["Row"];

export default function CommitteePage() {
  const [selectedYear, setSelectedYear] = useState<string>("All Years");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeRow[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("committee_members")
        .select("*")
        .eq("is_published", true)
        .order("committee_year", { ascending: false })
        .order("sort_order");

      if (error) {
        console.error("[Committee] Error loading committee members:", error);
      }

      if (data) {
        setCommitteeMembers(data);
        const years = Array.from(new Set(data.map((m) => m.committee_year))).sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0].toString());
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

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
          <span className="text-xs uppercase tracking-[0.28em] text-[#a57f12] font-semibold block">
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
              className={`min-h-[44px] px-4 py-2.5 text-sm uppercase tracking-[0.12em] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center ${
                selectedYear === year
                  ? "bg-[#1b3622] text-[#fbf9f4] font-semibold shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#1b3622]/30 hover:text-[#1b3622]"
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
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className="animate-fade-up bg-white border border-[#1b3622]/10 group shadow-sm hover:shadow-[0_16px_40px_rgba(27,54,34,0.10)] hover:border-[#d4af37]/30 hover:-translate-y-1 transition-all duration-500 ease-premium flex flex-col h-full rounded-sm overflow-hidden"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              {/* Profile Image View Box */}
              <div className="aspect-square bg-[#fbf9f4] relative overflow-hidden shrink-0 border-b border-gray-50">
                {member.image_url ? (
                  <LightboxImage
                    src={member.image_url}
                    alt={`${member.name} profile`}
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1b3622]/5">
                    <Users className="h-12 w-12 text-[#1b3622]/25" />
                  </div>
                )}
                {/* Gold hairline reveal on hover */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#d4af37] transition-transform duration-500 ease-premium group-hover:scale-x-100"
                />
              </div>

              {/* Data Specifications Content Block */}
              <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#a57f12] tracking-[0.12em] uppercase block">
                    {member.branch || "Unspecified Branch"}
                  </span>
                  <h3 className="text-xl text-[#1b3622] font-serif font-medium leading-snug break-words">
                    {member.name}
                  </h3>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-gray-100">
                  {/* Role placed above Location with prominent typography */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1b3622] tracking-[0.06em] uppercase leading-snug">
                      {member.role}
                    </span>
                  </div>
                  {/* Location secondary under Role */}
                  {member.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-normal break-words">
                      <MapPin className="h-4 w-4 text-[#d4af37] shrink-0" />
                      <span>{member.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
