"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LightboxImage from "@/components/ui/LightboxImage";
import { hierarchy, tree } from "d3-hierarchy";

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

// Internal Tree Node structure for D3 Hierarchy
interface TreeNode {
  id: string;
  member: Member;
  spouse?: Member;
  children: TreeNode[];
  isExpanded: boolean;
  isMatch: boolean;
  spouseMatch: boolean;
  branchName?: string;
  generation: number;
  hasUnexpandedChildren: boolean;
  totalChildrenCount: number;
}

const CARD_WIDTH = 176;
const COUPLE_GAP = 24;
const COUPLE_PADDING = 20; // p-2.5 × 2
// Keep each sibling lane wider than the largest couple card (two cards plus connector).
const SIBLING_GAP = 240;
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function coupleBlockWidth(node: TreeNode) {
  return CARD_WIDTH + (node.spouse ? CARD_WIDTH + COUPLE_GAP : 0) + COUPLE_PADDING;
}

function collectBranchNames(node: TreeNode, set = new Set<string>()) {
  if (node.branchName) set.add(node.branchName);
  node.children.forEach(child => collectBranchNames(child, set));
  return set;
}

function getBranchHueMap(treeData: TreeNode | null): Record<string, number> {
  const map: Record<string, number> = {};
  if (!treeData) return map;
  const branches = Array.from(collectBranchNames(treeData)).sort();
  branches.forEach((name, i) => {
    // Golden-ratio spread for distinct, perceptively separated hues
    map[name] = (45 + i * 137.5) % 360;
  });
  return map;
}

function branchHue(branchName: string | undefined, map: Record<string, number>): number {
  if (!branchName) return 45;
  return map[branchName] ?? 45;
}

function branchColor(
  branchName: string | undefined,
  map: Record<string, number>,
  alpha: number,
  opts: { deceased?: boolean; lighten?: number; saturation?: number } = {}
): string {
  const hue = branchHue(branchName, map);
  const saturation = opts.deceased ? 10 : (opts.saturation ?? 72);
  const lightness = (opts.deceased ? 58 : 45) + (opts.lighten || 0);
  return `hsla(${hue}, ${saturation}%, ${Math.max(0, Math.min(100, lightness))}%, ${alpha})`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function formatLifeDates(birthDate: string | null, deathDate: string | null) {
  if (!birthDate && !deathDate) return "";
  const birthYear = birthDate ? birthDate.split("-")[0] : "?";
  const deathYear = deathDate ? deathDate.split("-")[0] : "Present";
  if (birthDate && !deathDate) return `b. ${birthYear}`;
  return `${birthYear} — ${deathYear}`;
}

function MemberCard({
  member,
  generation,
  isMatch,
  branchName,
  map,
}: {
  member: Member;
  generation: number;
  isMatch: boolean;
  branchName?: string;
  map: Record<string, number>;
}) {
  const formattedDates = formatLifeDates(member.birth_date, member.death_date);
  const initials = getInitials(member.name);
  const isDeceased = !!member.death_date;

  return (
    <div
      className="w-[176px] p-2 flex flex-col gap-1.5 rounded-xl transition-all"
      style={{
        backgroundColor: isDeceased
          ? "hsla(0, 0%, 92%, 0.85)"
          : branchColor(branchName, map, 0.08, { lighten: 48 }),
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: isDeceased
          ? "hsla(0, 0%, 60%, 0.3)"
          : branchColor(branchName, map, 0.45),
        boxShadow: isMatch
          ? `0 0 0 2px ${branchColor(branchName, map, 0.85)}`
          : "none",
        filter: isDeceased ? "grayscale(0.65) brightness(0.96)" : "none",
      }}
    >
      <div className="flex items-center gap-3">
        {member.photo_url ? (
          <LightboxImage
            src={member.photo_url}
            alt={member.name || "Member Photo"}
            buttonClassName="h-auto w-auto shrink-0"
            className="w-10 h-10 rounded-full object-cover border border-[#1b3622]/15 shrink-0 shadow-sm"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full border flex items-center justify-center font-serif text-[11px] font-semibold tracking-wider shrink-0 select-none shadow-sm"
            style={{
              backgroundColor: branchColor(branchName, map, 0.15, { lighten: 45 }),
              borderColor: branchColor(branchName, map, 0.5),
              color: branchColor(branchName, map, 1, { lighten: -5 }),
            }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0 justify-center">
          <span
            className="text-[9px] font-bold tracking-[0.14em] uppercase select-none leading-none mb-1"
            style={{ color: branchColor(branchName, map, 1) }}
          >
            GEN {generation}
          </span>
          <h4
            className="font-serif text-[14px] font-medium leading-[1.2] line-clamp-2 min-h-[34px] text-[#1b3622]"
            title={member.name || "Unknown Member"}
          >
            {member.name || "Unknown Member"}
          </h4>
          {formattedDates && (
            <span className="text-[11px] font-serif font-normal tracking-wide mt-0.5 select-none truncate flex items-center text-gray-600">
              {formattedDates} {isDeceased && <span className="italic ml-1 opacity-70">✝</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CoupleBlock({
  node,
  map,
  className = "",
  wrap = false,
}: {
  node: TreeNode;
  map: Record<string, number>;
  className?: string;
  wrap?: boolean;
}) {
  const branch = node.branchName;
  return (
    <div
      className={`items-center gap-2 rounded-2xl border bg-white/95 backdrop-blur-md p-2.5 transition-shadow hover:shadow-md ${wrap ? "flex flex-row flex-wrap" : "flex"} ${className}`}
      style={{
        borderColor: branchColor(branch, map, 0.5),
        boxShadow: `0 0 20px ${branchColor(branch, map, 0.15)}, 0 4px 12px ${branchColor(branch, map, 0.08)}`,
      }}
    >
      <MemberCard
        member={node.member}
        generation={node.generation}
        isMatch={node.isMatch}
        branchName={branch}
        map={map}
      />
      {node.spouse && (
        <>
          <div
            className="flex flex-col items-center justify-center gap-1"
            style={{ color: branchColor(branch, map, 1) }}
          >
            <div className="h-px w-3 bg-current/40" />
            <Heart className="w-3 h-3 fill-current/20 shrink-0" />
            <div className="h-px w-3 bg-current/40" />
          </div>
          <MemberCard
            member={node.spouse}
            generation={node.generation}
            isMatch={node.spouseMatch}
            branchName={branch}
            map={map}
          />
        </>
      )}
    </div>
  );
}

function ExpandButton({
  node,
  onClick,
  map,
}: {
  node: TreeNode;
  onClick: (e: React.MouseEvent) => void;
  map: Record<string, number>;
}) {
  if (!node.hasUnexpandedChildren && !node.isExpanded) return null;
  return (
    <button
      onClick={onClick}
      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-[#fbf9f4] transition-colors z-20 cursor-pointer focus:outline-none focus:ring-2"
      style={{
        borderColor: branchColor(node.branchName, map, 0.3),
        color: branchColor(node.branchName, map, 1),
      }}
      title={node.isExpanded ? "Collapse" : `Expand (${node.totalChildrenCount} children)`}
    >
      {node.isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
    </button>
  );
}

function TreeLegend({ map }: { map: Record<string, number> }) {
  const branches = Object.keys(map);
  if (branches.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-[0.1em] text-gray-700" aria-label="Branch colour legend">
      {branches.map((branch) => (
        <span key={branch} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: branchColor(branch, map, 1) }} />
          {branch}
        </span>
      ))}
    </div>
  );
}

function MobileNode({
  node,
  toggleNode,
  map,
}: {
  node: TreeNode;
  toggleNode: (id: string) => void;
  map: Record<string, number>;
}) {
  const branch = node.branchName;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative">
        <CoupleBlock node={node} map={map} wrap />
        <ExpandButton
          node={node}
          onClick={(e) => {
            e.stopPropagation();
            toggleNode(node.id);
          }}
          map={map}
        />
      </div>

      {node.isExpanded && node.children.length > 0 && (
        <div className="w-full flex flex-row items-stretch mt-6">
          {/* Vertical trunk line */}
          <div className="w-4 sm:w-6 flex-shrink-0 flex justify-center">
            <div
              className="w-0.5 h-full bg-current opacity-30 rounded-full"
              style={{ color: branchColor(branch, map, 1) }}
            />
          </div>
          <div className="flex-1 flex flex-col items-start gap-5 pb-2">
            {node.children.map((child) => (
              <div key={child.id} className="relative w-full flex flex-col items-start">
                {/* Horizontal connector from trunk to child block */}
                <div
                  className="absolute top-6 left-0 w-4 h-0.5 bg-current opacity-30 rounded-full"
                  style={{ color: branchColor(child.branchName, map, 1) }}
                />
                <MobileNode node={child} toggleNode={toggleNode} map={map} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopTree({
  treeData,
  toggleNode,
  map,
}: {
  treeData: TreeNode;
  toggleNode: (id: string) => void;
  map: Record<string, number>;
}) {
  const root = hierarchy(treeData);
  tree<TreeNode>().nodeSize([CARD_WIDTH + COUPLE_PADDING + SIBLING_GAP, 270])(root);
  const nodes = root.descendants();
  const links = root.links();

  let minLeftX = Infinity;
  let maxRightX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  nodes.forEach((node) => {
    const width = coupleBlockWidth(node.data);
    const left = node.x ?? 0;
    const right = left + width;
    if (left < minLeftX) minLeftX = left;
    if (right > maxRightX) maxRightX = right;
    if ((node.y ?? 0) < minY) minY = node.y ?? 0;
    if ((node.y ?? 0) > maxY) maxY = node.y ?? 0;
  });

  const paddingX = 140;
  const paddingY = 140;
  const containerWidth = Math.max(maxRightX - minLeftX + paddingX * 2, 1000);
  const containerHeight = Math.max(maxY - minY + paddingY * 2 + 200, 800);
  const offsetX = -minLeftX + paddingX;
  const offsetY = -minY + paddingY;

  return (
    <div className="w-full h-[75vh] min-h-[600px] relative font-sans rounded-xl overflow-auto overscroll-contain border border-gray-200/50 shadow-sm cursor-auto bg-[#fbf9f4] [scroll-behavior:smooth] [scrollbar-color:#1b3622_#fbf9f4]">
      <div style={{ width: containerWidth, height: containerHeight, position: "relative" }}>
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            minWidth: "100%",
            minHeight: "100%",
          }}
        >
          {links.map((link, i) => {
            const sourceWidth = coupleBlockWidth(link.source.data);
            const targetWidth = coupleBlockWidth(link.target.data);
            const sourceX = (link.source.x ?? 0) + offsetX + sourceWidth / 2;
            const targetX = (link.target.x ?? 0) + offsetX + targetWidth / 2;
            const sourceY = (link.source.y ?? 0) + offsetY + 55;
            const targetY = (link.target.y ?? 0) + offsetY - 35;
            const midY = sourceY + (targetY - sourceY) / 2;
            const d = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
            const branch = link.target.data.branchName;

            return (
              <path
                key={`link-${i}`}
                d={d}
                fill="none"
                stroke={branchColor(branch, map, 0.6)}
                strokeWidth={2}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        <AnimatePresence>
          {nodes.map((node) => {
            const left = (node.x ?? 0) + offsetX;
            const top = (node.y ?? 0) + offsetY;

            return (
              <motion.div
                key={node.data.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
                style={{ position: "absolute", left, top, transform: "translateY(-50%)", zIndex: 10, width: coupleBlockWidth(node.data) }}
                className="flex flex-col items-center"
              >
                {node.data.generation === 2 && node.data.branchName && (
                  <div
                    className="absolute -top-12 whitespace-nowrap px-3 py-1.5 bg-white border rounded-full font-serif text-xs font-medium uppercase tracking-[0.14em] shadow-sm"
                    style={{
                      color: branchColor(node.data.branchName, map, 1),
                      borderColor: branchColor(node.data.branchName, map, 0.3),
                    }}
                  >
                    {node.data.branchName} Branch
                  </div>
                )}
                <CoupleBlock node={node.data} map={map} />
                <ExpandButton
                  node={node.data}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(node.data.id);
                  }}
                  map={map}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function FamilyTree({ members, rootId }: FamilyTreeProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const isMobile = useIsMobile();

  const rootPerson = useMemo(() => members.find((m) => m.id === rootId), [members, rootId]);

  // Find all members who match the query
  const matchingMembers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return members.filter((m) => m.name?.toLowerCase().includes(q) || m.bio?.toLowerCase().includes(q));
  }, [members, query]);

  // Compute ancestors to auto-expand for search results
  const autoExpandedNodes = useMemo(() => {
    const expanded = new Set<string>();
    if (matchingMembers.length === 0) return expanded;

    const queue = [...matchingMembers.map((m) => m.id)];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const member = members.find((m) => m.id === currentId);
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
          const spouse = members.find((m) => m.id === member.spouse_id);
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

  // Expand state includes root and auto-expanded ancestors for current query
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set([rootId, ...Array.from(autoExpandedNodes)])
  );

  // Keep expandedNodes in sync with search-derived ancestors without calling
  // setState directly in the effect body. Use a flag derived on previous render.
  const [prevAutoExpanded, setPrevAutoExpanded] = useState<string>("");
  const autoExpandedKey = Array.from(autoExpandedNodes).sort().join(",");
  if (autoExpandedKey !== prevAutoExpanded && autoExpandedNodes.size > 0) {
    setPrevAutoExpanded(autoExpandedKey);
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      autoExpandedNodes.forEach((id) => next.add(id));
      return next;
    });
  }

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Build the hierarchical tree data structure
  const treeData = useMemo(() => {
    if (!rootPerson) return null;

    // Index records once per render so expanding a large archive stays responsive.
    const memberById = new Map(members.map((member) => [member.id, member]));
    const childrenByParent = new Map<string, Member[]>();
    members.forEach((member) => {
      [member.father_id, member.mother_id].forEach((parentId) => {
        if (!parentId) return;
        const existing = childrenByParent.get(parentId) || [];
        existing.push(member);
        childrenByParent.set(parentId, existing);
      });
    });

    const buildTree = (
      personId: string,
      generation: number,
      visited: Set<string>,
      branchName?: string
    ): TreeNode | null => {
      if (visited.has(personId)) return null;
      const person = memberById.get(personId);
      if (!person) return null;

      visited.add(personId);
      const spouse = person.spouse_id ? memberById.get(person.spouse_id) : members.find((m) => m.spouse_id === personId);
      if (spouse) visited.add(spouse.id);

      const childrenById = new Map<string, Member>();
      [...(childrenByParent.get(personId) || []), ...(spouse ? childrenByParent.get(spouse.id) || [] : [])]
        .forEach((child) => childrenById.set(child.id, child));
      const children = Array.from(childrenById.values());

      const isExpanded = expandedNodes.has(personId);
      const childNodes: TreeNode[] = [];

      if (isExpanded) {
        children.forEach((child) => {
          // Identify major branches at the children of the root (generation 1 -> child generation 2)
          const childBranchName = generation === 1 ? (child.name || "Unknown Branch") : branchName;
          const childNode = buildTree(child.id, generation + 1, new Set(visited), childBranchName);
          if (childNode) childNodes.push(childNode);
        });
      }

      return {
        id: personId,
        member: person,
        spouse: spouse,
        children: childNodes,
        isExpanded,
        isMatch: matchingMembers.some((m) => m.id === personId),
        spouseMatch: spouse ? matchingMembers.some((m) => m.id === spouse.id) : false,
        branchName,
        generation,
        hasUnexpandedChildren: !isExpanded && children.length > 0,
        totalChildrenCount: children.length,
      };
    };

    return buildTree(rootId, 1, new Set<string>());
  }, [rootId, members, expandedNodes, matchingMembers, rootPerson]);

  const branchHueMap = useMemo(() => getBranchHueMap(treeData), [treeData]);

  const expandAll = useCallback(() => {
    setExpandedNodes(new Set(members.map((member) => member.id)));
  }, [members]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set([rootId]));
  }, [rootId]);

  if (!rootPerson || !treeData) {
    return (
      <div className="text-center py-12 text-[#1b3622] font-serif text-lg px-4">
        Root ancestor record not found in the database.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-[#1b3622]/10 bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <TreeLegend map={branchHueMap} />
        <div className="flex items-center gap-2">
          <button type="button" onClick={collapseAll} className="rounded-md border border-[#1b3622]/15 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#1b3622] transition-colors hover:bg-[#fbf9f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]">Collapse</button>
          <button type="button" onClick={expandAll} className="rounded-md bg-[#1b3622] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#2b5134] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]">Expand all</button>
        </div>
      </div>
      {isMobile ? (
        <div className="w-full h-[75vh] min-h-[600px] relative font-sans rounded-xl overflow-auto overscroll-contain border border-gray-200/50 shadow-sm cursor-auto bg-[#fbf9f4] p-4 sm:p-6 [scroll-behavior:smooth] touch-pan-y">
          <MobileNode node={treeData} toggleNode={toggleNode} map={branchHueMap} />
        </div>
      ) : <DesktopTree treeData={treeData} toggleNode={toggleNode} map={branchHueMap} />}
    </div>
  );
}
