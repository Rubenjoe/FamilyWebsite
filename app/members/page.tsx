"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { MapPin, Briefcase, Search, Users } from "lucide-react";
import { MOCK_COMMITTEE_MEMBERS } from "../../data/mockData";
import LightboxImage from "@/components/ui/LightboxImage";
import { createClient } from "@/utils/supabase/client";

export default function MembersDirectory() {
    const [selectedBranch, setSelectedBranch] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [committeeMembers, setCommitteeMembers] = useState(MOCK_COMMITTEE_MEMBERS);
    useEffect(() => { createClient().from("heritage_records").select("id,name,branch,title,location,image_url").eq("kind", "committee").eq("is_published", true).order("sort_order").then(({ data }) => { if (data) setCommitteeMembers(data.map((row) => ({ id: row.id, firstName: row.name, lastName: "", generation: 1, branch: row.branch, profession: row.title || undefined, location: row.location || "", profilePhotoUrl: row.image_url || "/images/logo.png", isAlive: true }))); }); }, []);

    // Live filter engine checking state bounds
    const filteredMembers = committeeMembers.filter(member => {
        const matchesBranch = selectedBranch === "All" || member.branch === selectedBranch;
        const matchesSearch =
            member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (member.profession && member.profession.toLowerCase().includes(searchQuery.toLowerCase())) ||
            member.location.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesBranch && matchesSearch;
    });

    const branches = ["All", ...Array.from(new Set(committeeMembers.map((member) => member.branch)))];

    return (
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">

            {/* Header Block Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[#1b3622]/5">
                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">Pullazhiyil Kudumbayogam</span>
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
                            className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-xs tracking-wide focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                        />
                    </div>
                </div>
            </div>

            {/* Interactive Quick Branch Filter Row */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                {branches.map(branch => (
                    <button
                        key={branch}
                        onClick={() => setSelectedBranch(branch)}
                        className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all ${selectedBranch === branch
                            ? "bg-[#1b3622] text-[#fbf9f4] font-semibold"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-[#1b3622]/30"
                            }`}
                    >
                        {branch} {branch !== "All" ? "Branch" : "Members"}
                    </button>
                ))}
            </div>

            {/* Grid Matrix Layout Pipeline */}
            {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredMembers.map(member => (
                        <div
                            key={member.id}
                            className="bg-white border border-gray-100 group shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Profile Image View Box */}
                            <div className="aspect-square bg-gray-50 relative overflow-hidden shrink-0 border-b border-gray-50">
                                <LightboxImage
                                    src={member.profilePhotoUrl}
                                    alt={`${member.firstName} profile`}
                                    className="object-cover w-full h-full transition-all duration-500"
                                />
                                {!member.isAlive && (
                                    <span className="absolute top-3 right-3 bg-[#2d312e]/90 text-[#fbf9f4] px-2 py-0.5 font-serif italic text-[10px] tracking-wide">
                                        Late Remembrance
                                    </span>
                                )}
                            </div>

                            {/* Data Specifications Content Block */}
                            <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-[#d4af37] tracking-widest uppercase block">
                                        {member.branch} Branch — Gen {member.generation}
                                    </span>
                                    <h3 className="text-lg text-[#1b3622] font-medium leading-snug">
                                        {member.firstName} {member.lastName}
                                        {member.malayalamName && (
                                            <span className="block text-xs text-gray-400 font-sans font-normal mt-0.5">
                                                {member.malayalamName}
                                            </span>
                                        )}
                                    </h3>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-50 text-xs text-gray-500 font-light">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{member.location}</span>
                                    </div>
                                    {member.profession && (
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span className="truncate">{member.profession}</span>
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
                    <p className="text-sm text-gray-400 italic">No matching member record entries found matching those specific query bounds.</p>
                </div>
            )}

        </div>
    );
}
