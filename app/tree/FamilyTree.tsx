"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import LightboxImage from "@/components/ui/LightboxImage";

export interface Member {
  id: string;
  name: string | null;
  photo_url: string | null;
  birth_date: string | null;
  death_date: string | null;
  bio: string | null;
  father_id: string | null;
  mother_id: string | null;
  spouse_id: string | null;
}

interface FamilyTreeProps {
  members: Member[];
  rootId: string;
}

export default function FamilyTree({ members, rootId }: FamilyTreeProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  // Find all members who match the query
  const matchingMembers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return members.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q)
    );
  }, [members, query]);

  // Compute all ancestors of the matching members to pre-expand them
  const autoExpandedNodes = useMemo(() => {
    const expanded = new Set<string>();
    if (matchingMembers.length === 0) return expanded;

    const queue = [...matchingMembers.map(m => m.id)];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const member = members.find(m => m.id === currentId);
      if (member) {
        if (member.father_id) {
          expanded.add(member.father_id);
          queue.push(member.father_id);
        }
        if (member.mother_id) {
          expanded.add(member.mother_id);
          queue.push(member.mother_id);
        }
        if (member.spouse_id) {
          const spouse = members.find(m => m.id === member.spouse_id);
          if (spouse) {
            if (spouse.father_id) {
              expanded.add(spouse.father_id);
              queue.push(spouse.father_id);
            }
            if (spouse.mother_id) {
              expanded.add(spouse.mother_id);
              queue.push(spouse.mother_id);
            }
          }
        }
      }
    }
    return expanded;
  }, [matchingMembers, members]);

  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});

  const isNodeExpanded = (nodeId: string) => {
    if (manualExpanded[nodeId] !== undefined) {
      return manualExpanded[nodeId];
    }
    return autoExpandedNodes.has(nodeId);
  };

  const toggleNode = (nodeId: string) => {
    setManualExpanded(prev => ({
      ...prev,
      [nodeId]: !isNodeExpanded(nodeId)
    }));
  };

  const shouldReduceMotion = useReducedMotion();

  // Prevent circular reference render loops
  const visited = useMemo(() => new Set<string>(), []);

  // Find root
  const rootPerson = members.find(m => m.id === rootId);

  if (!rootPerson) {
    return (
      <div className="text-center py-12 text-[#1b3622] font-serif text-lg px-4">
        Root ancestor record not found in the database.
      </div>
    );
  }

  // Clear visited set before rendering tree roots
  visited.clear();

  return (
    <div className="w-full overflow-x-auto py-4 sm:py-8">
      <div className="min-w-0 sm:min-w-[700px] flex flex-col items-center px-2 sm:px-0">
        {renderTreeNode(
          rootPerson,
          members,
          1,
          isNodeExpanded,
          toggleNode,
          matchingMembers.map(m => m.id),
          visited,
          shouldReduceMotion ?? false
        )}
      </div>
    </div>
  );
}

function renderTreeNode(
  person: Member,
  members: Member[],
  generation: number,
  isNodeExpanded: (id: string) => boolean,
  toggleNode: (id: string) => void,
  matchingIds: string[],
  visited: Set<string>,
  shouldReduceMotion: boolean
): React.ReactNode {
  if (visited.has(person.id)) return null;
  visited.add(person.id);

  // Find spouse
  const spouse = members.find(m => m.id === person.spouse_id || person.spouse_id === m.id);
  if (spouse) {
    visited.add(spouse.id);
  }

  // Find children
  const children = members.filter(
    m =>
      m.father_id === person.id ||
      m.mother_id === person.id ||
      (spouse && (m.father_id === spouse.id || m.mother_id === spouse.id))
  );

  const isExpanded = isNodeExpanded(person.id);
  const hasChildren = children.length > 0;

  const isPersonMatch = matchingIds.includes(person.id);
  const isSpouseMatch = spouse ? matchingIds.includes(spouse.id) : false;

  return (
    <div className="flex flex-col items-center w-full sm:w-auto">
      {/* Couple Block */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 bg-white/50 p-3 sm:p-4 rounded-2xl border border-[#1b3622]/5 shadow-sm w-full max-w-[280px] sm:w-auto sm:max-w-none">
        {/* Person Card */}
        <MemberCard member={person} generation={generation} isMatch={isPersonMatch} />

        {/* Marriage Connector */}
        {spouse && (
          <div className="flex sm:flex-col items-center justify-center gap-1 my-0.5 sm:my-0 text-[#d4af37]">
            <div className="h-[2px] w-4 sm:w-[2px] sm:h-4 bg-[#d4af37]/35"></div>
            <Heart className="w-3.5 h-3.5 fill-[#d4af37]/10 shrink-0" />
            <div className="h-[2px] w-4 sm:w-[2px] sm:h-4 bg-[#d4af37]/35"></div>
          </div>
        )}

        {/* Spouse Card */}
        {spouse && (
          <MemberCard member={spouse} generation={generation} isMatch={isSpouseMatch} />
        )}
      </div>

      {/* Children Junction */}
      {hasChildren && (
        <div className="flex flex-col items-center mt-3 sm:mt-4 w-full">
          {/* Connector Line to Toggle */}
          <div className="w-[2px] h-5 sm:h-6 bg-[#1b3622]/15"></div>

          {/* Expand/Collapse Toggle Button */}
          <button
            onClick={() => toggleNode(person.id)}
            className="flex items-center gap-2 bg-[#fbf9f4] border border-[#1b3622]/20 hover:border-[#1b3622] hover:bg-white text-[#1b3622] px-4 py-2 sm:py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-sm transition-all duration-200 cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf9f4]"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Hide Descendants</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Show Descendants ({children.length})</span>
              </>
            )}
          </button>

          {/* Children container with collapse transition */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeInOut" }}
                className="w-full overflow-hidden"
              >
                {/* Connector Line down from Toggle Button to Children Container */}
                <div className="w-[2px] h-5 sm:h-6 bg-[#1b3622]/15 mx-auto"></div>

                {/* Sub-tree Container */}
                <div className="flex flex-col items-stretch max-w-4xl mx-auto pl-6 sm:pl-12 pr-2 sm:pr-4 space-y-5 sm:space-y-6 relative border-l border-[#1b3622]/15 ml-3 sm:ml-8 md:ml-12">
                  {children.map((child, index) => {
                    const isLast = index === children.length - 1;
                    return (
                      <div key={child.id} className="relative">
                        {/* Horizontal Line Connector - desktop/tablet only; mobile relies on the trunk line for hierarchy */}
                        <div className="hidden sm:block absolute left-[-49px] top-12 w-12 h-[2px] bg-[#1b3622]/15"></div>
                        {isLast && (
                          <div className="hidden sm:block absolute left-[-49px] top-12 bottom-0 w-[2px] bg-[#fbf9f4]"></div>
                        )}

                        <div className="w-full flex justify-center sm:justify-start">
                          {renderTreeNode(
                            child,
                            members,
                            generation + 1,
                            isNodeExpanded,
                            toggleNode,
                            matchingIds,
                            visited,
                            shouldReduceMotion
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatLifeDates(birthDate: string | null, deathDate: string | null) {
  if (!birthDate && !deathDate) return "";
  const birthYear = birthDate ? birthDate.split("-")[0] : "?";
  const deathYear = deathDate ? deathDate.split("-")[0] : "Present";

  if (birthDate && !deathDate) {
    return `b. ${birthYear}`;
  }
  return `${birthYear} — ${deathYear}`;
}

function MemberCard({ member, generation, isMatch }: { member: Member; generation: number; isMatch: boolean }) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const formattedDates = formatLifeDates(member.birth_date, member.death_date);
  const initials = getInitials(member.name);
  const isDeceased = !!member.death_date;

  return (
    <div
      className={`w-full sm:w-[260px] max-w-[280px] sm:max-w-none bg-white border rounded-xl p-3.5 sm:p-4 flex flex-col gap-2 shadow-sm transition-all duration-300 ${isMatch
        ? "border-[#d4af37] ring-2 ring-[#d4af37]/45 bg-[#d4af37]/5"
        : "border-[#1b3622]/10 hover:border-[#d4af37] hover:shadow-md"
        }`}
    >
      <div className="flex items-center gap-3">
        {member.photo_url ? (
          <LightboxImage
            src={member.photo_url}
            alt={member.name || "Member Photo"}
            buttonClassName="h-auto w-auto shrink-0"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-[#1b3622]/15 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fbf9f4] border border-[#d4af37]/50 flex items-center justify-center text-[#1b3622] font-serif text-sm font-semibold tracking-wider shrink-0 select-none">
            {initials}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-[8px] font-bold text-[#d4af37] tracking-[0.25em] uppercase select-none">
            GEN {generation}
          </span>
          <h4 className="font-serif text-[14px] sm:text-[15px] font-semibold text-[#1b3622] leading-tight truncate">
            {member.name || "Unknown Member"}
          </h4>
          {formattedDates && (
            <span className="text-[10px] font-serif font-light text-gray-500 tracking-wide mt-0.5 select-none">
              {formattedDates}
            </span>
          )}
        </div>
      </div>

      {isDeceased && (
        <div className="inline-flex self-start bg-gray-100/90 px-2 py-0.5 font-serif italic text-[9px] text-[#2d312e]/80 select-none">
          Late Remembrance
        </div>
      )}

      {member.bio && (
        <div className="border-t border-gray-100 pt-2 mt-1">
          <p className={`text-[11px] font-light text-[#2e312f]/90 leading-relaxed ${bioExpanded ? "" : "line-clamp-2"}`}>
            {member.bio}
          </p>
          {member.bio.length > 55 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBioExpanded(!bioExpanded);
              }}
              className="text-[9px] uppercase tracking-wider font-bold text-[#d4af37] mt-1 hover:text-[#1b3622] cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-1 rounded-sm"
            >
              {bioExpanded ? "Show Less" : "Read Bio"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
