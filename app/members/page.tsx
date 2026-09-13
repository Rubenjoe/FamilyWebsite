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
        return;
      }

      if (data) {
        setCommitteeMembers(data);
        const years = Array.from(new Set(data.map((m) => m.committee_year))).sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0].toString());
        }
      }
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
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
      {/* Header Block Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[#1b3622]/5">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">
            Pullazhiyil Kudumbayogam
          </span>
          <h1 className="text-3xl md:text-4xl text-[#1b3622] font-normal">Executive Committee</h1>
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
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-sm tracking-wide focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
            />
          </div>
        </div>
      </div>

      {/* Interactive Quick Year Filter Row */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2.5 text-sm uppercase tracking-[0.12em] font-medium transition-all ${
              selectedYear === year
                ? "bg-[#1b3622] text-[#fbf9f4] font-semibold"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#1b3622]/30"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Grid Matrix Layout Pipeline */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-gray-100 group shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              {/* Profile Image View Box */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden shrink-0 border-b border-gray-50">
                {member.image_url ? (
                  <LightboxImage
                    src={member.image_url}
                    alt={`${member.name} profile`}
                    className="object-cover w-full h-full transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1b3622]/5">
                    <Users className="h-12 w-12 text-[#1b3622]/30" />
                  </div>
                )}
              </div>

              {/* Data Specifications Content Block */}
              <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#a57f12] tracking-[0.12em] uppercase block">
                    {member.branch || "Unspecified Branch"}
                  </span>
                  <h3 className="text-xl text-[#1b3622] font-medium leading-snug">
                    {member.name}
                  </h3>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-gray-100">
                  {/* Role placed above Location with prominent typography */}
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-[#1b3622] tracking-[0.06em] uppercase leading-snug">
                      {member.role}
                    </span>
                  </div>
                  {/* Location secondary under Role */}
                  {member.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-normal">
                      <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>{member.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-200 bg-white/40 space-y-3">
          <Users className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400 italic">
            {selectedYear === "All Years"
              ? "No committee records are available."
              : `No committee records are available for ${selectedYear}.`}
          </p>
        </div>
      )}
    </div>
  );
}
