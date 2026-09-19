"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  Plus,
  Minus,
  Users,
  Scan,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hierarchy, tree } from "d3-hierarchy";
import { select } from "d3-selection";
import type { Selection } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import type { ZoomBehavior, ZoomTransform } from "d3-zoom";
import "d3-transition";

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

/* ────────────────────────────  DESIGN TOKENS  ──────────────────────────── */

const CARD_WIDTH = 156;
const CARD_HEIGHT = 116; // uniform plaque height (medallion + up to 2 name lines)
const COUPLE_GAP = 18;
const COUPLE_PADDING = 18;
const SIBLING_GAP = 226;
const NODE_DX = CARD_WIDTH + COUPLE_PADDING + SIBLING_GAP; // sibling lane
const NODE_DY = 290; // vertical distance between generation centres
const LINK_SRC_DY = 64; // anchor below parent centre (clear of plaque)
const LINK_TGT_DY = 64; // anchor above child centre (clear of plaque)
const PADDING_X = 150;
const PADDING_Y = 175;

const GOLD = "#d4af37";

interface Hsl {
  h: number;
  s: number;
  l: number;
}

/**
 * Hand-curated, harmonious branch palette (no random hues).
 * Warm, archival tones that all sit comfortably on the cream canvas.
 */
const BRANCH_PALETTE: Hsl[] = [
  { h: 152, s: 40, l: 30 }, // emerald
  { h: 36, s: 66, l: 38 }, // amber
  { h: 12, s: 60, l: 42 }, // terracotta
  { h: 338, s: 44, l: 42 }, // wine rose
  { h: 270, s: 32, l: 46 }, // plum
  { h: 176, s: 46, l: 29 }, // pine teal
  { h: 84, s: 42, l: 32 }, // olive
  { h: 26, s: 50, l: 36 }, // bronze
];

const ROOT_TONE: Hsl = { h: 44, s: 48, l: 35 }; // founders' gold-olive

/* ────────────────────────────  UTILITIES  ──────────────────────────── */

function coupleBlockWidth(node: TreeNode) {
  return CARD_WIDTH + (node.spouse ? CARD_WIDTH + COUPLE_GAP : 0) + COUPLE_PADDING;
}

function collectBranchNames(node: TreeNode, set = new Set<string>()) {
  if (node.branchName) set.add(node.branchName);
  node.children.forEach((child) => collectBranchNames(child, set));
  return set;
}

/** Stable, curated colour per branch (sorted alphabetically for determinism). */
function getBranchToneMap(treeData: TreeNode | null): Record<string, Hsl> {
  const map: Record<string, Hsl> = {};
  if (!treeData) return map;
  const branches = Array.from(collectBranchNames(treeData)).sort();
  branches.forEach((name, i) => {
    // step through the palette with a co-prime stride so neighbouring
    // branches never land on similar hues
    map[name] = BRANCH_PALETTE[(i * 3) % BRANCH_PALETTE.length];
  });
  return map;
}

function branchColor(
  branchName: string | undefined,
  map: Record<string, Hsl>,
  alpha: number,
  opts: { deceased?: boolean; lighten?: number; saturation?: number } = {}
): string {
  const tone = (branchName && map[branchName]) || ROOT_TONE;
  const saturation = opts.deceased ? 8 : (opts.saturation ?? tone.s);
  const lightness = (opts.deceased ? 46 : tone.l) + (opts.lighten || 0);
  const h = opts.deceased ? 40 : tone.h; // sepia drift for departed members
  return `hsla(${h}, ${saturation}%, ${Math.max(0, Math.min(100, lightness))}%, ${alpha})`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function romanNumeral(n: number) {
  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return numerals[n - 1] ?? String(n);
}

/** Rounded elbow connector between parent and child. */
function elbowPath(x1: number, y1: number, x2: number, y2: number, r = 16) {
  if (Math.abs(x2 - x1) < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midY = y1 + (y2 - y1) / 2;
  const dir = x2 > x1 ? 1 : -1;
  const rr = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(midY - y1), Math.abs(y2 - midY));
  return [
    `M ${x1} ${y1}`,
    `L ${x1} ${midY - rr}`,
    `Q ${x1} ${midY} ${x1 + dir * rr} ${midY}`,
    `L ${x2 - dir * rr} ${midY}`,
    `Q ${x2} ${midY} ${x2} ${midY + rr}`,
    `L ${x2} ${y2}`,
  ].join(" ");
}

/* Self-contained keyframes so the file stays drop-in portable. */
const TREE_STYLES = `
@keyframes ft-dash { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes ft-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.50); }
  70%  { box-shadow: 0 0 0 11px rgba(212,175,55,0); }
  100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
}
.ft-pulse-ring { animation: ft-pulse-ring 1.9s ease-out infinite; }
.ft-viewport { cursor: grab; }
.ft-viewport:active { cursor: grabbing; }
.ft-viewport::-webkit-scrollbar { width: 10px; height: 10px; }
.ft-viewport::-webkit-scrollbar-thumb { background: rgba(27,54,34,0.18); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
.ft-viewport::-webkit-scrollbar-track { background: transparent; }
`;

/* ────────────────────────────  MEMBER CARD  ──────────────────────────── */

const MemberCard = React.memo(function MemberCard({
  member,
  branchName,
  map,
}: {
  member: Member;
  branchName?: string;
  map: Record<string, Hsl>;
}) {
  const initials = getInitials(member.name);
  const isDeceased = !!member.death_date;
  const accent = isDeceased
    ? "linear-gradient(90deg, rgba(27,54,34,0.20), rgba(212,175,55,0.45))"
    : `linear-gradient(90deg, ${branchColor(branchName, map, 0.95)}, ${branchColor(branchName, map, 0.35)})`;

  return (
    <div
      className="relative flex w-[156px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-3 text-center"
      style={{
        height: CARD_HEIGHT,
        borderColor: isDeceased ? "rgba(27,54,34,0.12)" : branchColor(branchName, map, 0.22),
        background: isDeceased ? "#f8f4ea" : "#ffffff",
        boxShadow: "0 1px 2px rgba(27,54,34,0.05)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />

      {/* in memoriam marker */}
      {isDeceased && (
        <span
          className="absolute right-2 top-2 font-serif text-[10px] italic leading-none text-[#1b3622]/40"
          title="In memoriam"
        >
          ✝
        </span>
      )}

      {/* monogram medallion — the card's hero now that portraits are gone */}
      <div
        className="grid h-11 w-11 shrink-0 select-none place-items-center rounded-full font-serif text-[12.5px] font-bold tracking-wider text-white shadow-sm"
        style={{
          background: isDeceased
            ? `linear-gradient(135deg, ${branchColor(branchName, map, 0.85, { deceased: true, lighten: 8 })}, ${branchColor(branchName, map, 0.7, { deceased: true, lighten: -4 })})`
            : `linear-gradient(135deg, ${branchColor(branchName, map, 0.9, { lighten: 6 })}, ${branchColor(branchName, map, 0.75, { lighten: -6 })})`,
          boxShadow: `0 0 0 2px #ffffff, 0 0 0 3.5px ${isDeceased
            ? branchColor(branchName, map, 0.3, { deceased: true })
            : branchColor(branchName, map, 0.4)
            }`,
        }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <h4
        className="line-clamp-2 w-full break-words font-serif text-[13.5px] font-semibold leading-snug text-[#1b3622]"
        title={member.name || "Unknown Member"}
      >
        {member.name || "Unknown Member"}
      </h4>
    </div>
  );
});

/* ────────────────────────────  COUPLE BLOCK  ──────────────────────────── */

const CoupleBlock = React.memo(function CoupleBlock({
  node,
  map,
  wrap = false,
}: {
  node: TreeNode;
  map: Record<string, Hsl>;
  className?: string;
  wrap?: boolean;
}) {
  const branch = node.branchName;
  const isMatchy = node.isMatch || node.spouseMatch;

  return (
    <div
      className={`relative gap-1.5 rounded-2xl border border-black/[0.06] bg-white/95 p-2 backdrop-blur-sm transition-shadow duration-300 ${wrap ? "flex flex-col items-center" : "flex items-center"
        }`}
      style={{
        boxShadow: isMatchy
          ? `0 0 0 2px ${GOLD}, 0 14px 34px -14px ${branchColor(branch, map, 0.45)}`
          : `0 1px 2px rgba(27,54,34,0.05), 0 12px 32px -14px ${branchColor(branch, map, 0.4)}`,
      }}
    >
      {isMatchy && (
        <span className="ft-pulse-ring pointer-events-none absolute -inset-[3px] rounded-[20px]" />
      )}
      <MemberCard member={node.member} branchName={branch} map={map} />
      {node.spouse && (
        <>
          <div className="flex flex-col items-center justify-center">
            <span
              className="h-3.5 w-px"
              style={{ background: branchColor(branch, map, 0.35) }}
            />
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-white shadow-sm"
              style={{
                borderColor: branchColor(branch, map, 0.35),
                boxShadow: "0 2px 6px rgba(27,54,34,0.10)",
              }}
              title="Married"
            >
              <Heart className="h-3 w-3" style={{ color: GOLD, fill: GOLD }} />
            </span>
            <span
              className="h-3.5 w-px"
              style={{ background: branchColor(branch, map, 0.35) }}
            />
          </div>
          <MemberCard member={node.spouse} branchName={branch} map={map} />
        </>
      )}
    </div>
  );
});

/* ────────────────────────────  EXPAND BUTTON  ──────────────────────────── */

const ExpandButton = React.memo(function ExpandButton({
  node,
  onClick,
  map,
}: {
  node: TreeNode;
  onClick: (e: React.MouseEvent) => void;
  map: Record<string, Hsl>;
}) {
  if (!node.hasUnexpandedChildren && !node.isExpanded) return null;
  const collapsed = !node.isExpanded;
  return (
    <button
      onClick={onClick}
      className={`absolute -bottom-3.5 left-1/2 z-20 flex h-7 -translate-x-1/2 items-center rounded-full border bg-white shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] ${collapsed ? "gap-1 px-2" : "w-7 justify-center"
        }`}
      style={{
        borderColor: branchColor(node.branchName, map, 0.45),
        color: branchColor(node.branchName, map, 0.95),
      }}
      title={collapsed ? `Expand ${node.totalChildrenCount} children` : "Collapse"}
      aria-expanded={!collapsed}
      aria-label={collapsed ? `Expand ${node.totalChildrenCount} children` : "Collapse"}
    >
      {collapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
      {collapsed && <span className="text-[10px] font-bold leading-none">{node.totalChildrenCount}</span>}
    </button>
  );
});

/* ────────────────────────────  LEGEND  ──────────────────────────── */

function TreeLegend({ map, counts }: { map: Record<string, Hsl>; counts: Record<string, number> }) {
  const branches = Object.keys(map);
  if (branches.length === 0) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Branch colour legend"
    >
      {branches.map((branch) => (
        <span
          key={branch}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#1b3622]/8 bg-white px-2.5 py-1 shadow-[0_1px_2px_rgba(27,54,34,0.04)]"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: branchColor(branch, map, 1),
              boxShadow: `0 0 0 2.5px ${branchColor(branch, map, 0.18)}`,
            }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1b3622]/65">
            {branch}
          </span>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: branchColor(branch, map, 1) }}
          >
            {counts[branch] ?? 0}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ────────────────────────────  TREE CANVAS  ──────────────────────────── */

interface LayoutMeta {
  nodes: HierarchyPointNode<TreeNode>[];
  offsetX: number;
  offsetY: number;
}

// d3 type shims (kept local to avoid extra surface area)
type HierarchyPointNode<T> = import("d3-hierarchy").HierarchyPointNode<T>;

function TreeCanvas({
  treeData,
  toggleNode,
  map,
  matchKey,
  stats,
}: {
  treeData: TreeNode;
  toggleNode: (id: string) => void;
  map: Record<string, Hsl>;
  matchKey: string;
  stats: { generations: number; members: number };
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const selRef = useRef<Selection<HTMLDivElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const layoutRef = useRef<LayoutMeta | null>(null);
  const initialFitDone = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---- layout ---- */
  const layout = useMemo(() => {
    const root = hierarchy<TreeNode>(treeData);
    return tree<TreeNode>()
      .nodeSize([NODE_DX, NODE_DY])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.15))(root);
  }, [treeData]);

  const nodes = useMemo(() => layout.descendants(), [layout]);
  const links = useMemo(() => layout.links(), [layout]);

  const { offsetX, offsetY, contentW, contentH } = useMemo(() => {
    let minL = Infinity;
    let maxR = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    nodes.forEach((n) => {
      const half = coupleBlockWidth(n.data) / 2;
      const l = (n.x ?? 0) - half;
      const r = (n.x ?? 0) + half;
      if (l < minL) minL = l;
      if (r > maxR) maxR = r;
      if ((n.y ?? 0) < minY) minY = n.y ?? 0;
      if ((n.y ?? 0) > maxY) maxY = n.y ?? 0;
    });
    const offX = -minL + PADDING_X;
    const offY = -minY + PADDING_Y;
    return {
      offsetX: offX,
      offsetY: offY,
      contentW: Math.max(maxR - minL + PADDING_X * 2, 1000),
      contentH: Math.max(maxY - minY + PADDING_Y * 2, 760),
    };
  }, [nodes]);

  const genYs = useMemo(() => {
    const m = new Map<number, number>();
    nodes.forEach((n) => {
      if (!m.has(n.data.generation)) m.set(n.data.generation, n.y ?? 0);
    });
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [nodes]);

  // keep a ref in sync for imperative zoom helpers (effect-ordered so
  // downstream effects always see fresh layout data)
  useEffect(() => {
    layoutRef.current = { nodes, offsetX, offsetY };
  }, [nodes, offsetX, offsetY]);

  const applyTransform = useCallback((t: ZoomTransform) => {
    transformRef.current = t;
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
    }
    if (pctRef.current) {
      pctRef.current.textContent = `${Math.round(t.k * 100)}%`;
    }
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const zoom = d3zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.22, 1.75])
      .on("zoom", (event) => applyTransform(event.transform));

    const sel = select(el).call(zoom).on("dblclick.zoom", null);
    selRef.current = sel;
    zoomRef.current = zoom;
    return () => {
      sel.on(".zoom", null);
      selRef.current = null;
      zoomRef.current = null;
    };
  }, [applyTransform]);

  const moveTransform = useCallback((t: ZoomTransform, animate = true) => {
    const sel = selRef.current;
    const zoom = zoomRef.current;
    if (!sel || !zoom) return;
    if (animate) {
      sel.transition().duration(500).call(zoom.transform, t);
    } else {
      sel.call(zoom.transform, t);
    }
  }, []);

  const fitView = useCallback(
    (animate = true, vAlign: "center" | "top" = "center") => {
      const meta = layoutRef.current;
      const el = viewportRef.current;
      if (!meta || !el) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (vw === 0 || vh === 0) return;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      meta.nodes.forEach((n) => {
        const half = coupleBlockWidth(n.data) / 2;
        minX = Math.min(minX, (n.x ?? 0) - half);
        maxX = Math.max(maxX, (n.x ?? 0) + half);
        minY = Math.min(minY, (n.y ?? 0) - 102); // room for branch ribbons
        maxY = Math.max(maxY, (n.y ?? 0) + 76); // room for expand pills
      });

      const w = maxX - minX;
      const h = maxY - minY;
      const k = Math.max(0.22, Math.min(Math.min(vw / w, vh / h) * 0.94, 1.15));
      // node coords are raw layout space; the DOM world is shifted by
      // offsetX/offsetY, so the transform must account for that shift
      const tx = (vw - w * k) / 2 - (minX + meta.offsetX) * k;
      const ty = (vAlign === "top" ? 72 : (vh - h * k) / 2) - (minY + meta.offsetY) * k;
      moveTransform(zoomIdentity.translate(tx, ty).scale(k), animate);
    },
    [moveTransform]
  );

  useEffect(() => {
    if (initialFitDone.current) return;
    const raf = requestAnimationFrame(() => {
      initialFitDone.current = true;
      fitView(false, "top");
    });
    return () => cancelAnimationFrame(raf);
  }, [fitView]);

  const focusMatch = useCallback(
    (animate = true) => {
      const meta = layoutRef.current;
      const el = viewportRef.current;
      if (!meta || !el) return;
      const target = meta.nodes.find((n) => n.data.isMatch || n.data.spouseMatch);
      if (!target) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const k = Math.max(transformRef.current.k, 0.9);
      const cx = (target.x ?? 0) + meta.offsetX;
      const cy = (target.y ?? 0) + meta.offsetY;
      moveTransform(zoomIdentity.translate(vw / 2 - cx * k, vh * 0.42 - cy * k).scale(k), animate);
    },
    [moveTransform]
  );

  // recentre whenever the search result set changes
  useEffect(() => {
    if (!matchKey) return;
    const t = setTimeout(() => focusMatch(true), 80);
    return () => clearTimeout(t);
  }, [matchKey, focusMatch]);

  const zoomBy = useCallback(
    (factor: number) => {
      const sel = selRef.current;
      const zoom = zoomRef.current;
      if (!sel || !zoom) return;
      sel.transition().duration(280).call(zoom.scaleBy, factor);
    },
    []
  );

  const resetZoom = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const t = transformRef.current;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const cx = (vw / 2 - t.x) / t.k;
    const cy = (vh / 2 - t.y) / t.k;
    moveTransform(zoomIdentity.translate(vw / 2 - cx, vh / 2 - cy).scale(1), true);
  }, [moveTransform]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      shellRef.current?.requestFullscreen?.().catch(() => { });
    } else {
      document.exitFullscreen?.().catch(() => { });
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const hasQuery = matchKey.length > 0;

  return (
    <div ref={shellRef} className="relative">
      <style>{TREE_STYLES}</style>

      {/* canvas viewport — touch-none hands gestures to d3-zoom (drag pan +
          pinch zoom), preventing the browser from hijacking them for scrolling */}
      <div
        ref={viewportRef}
        className="ft-viewport relative h-[66vh] min-h-[500px] select-none touch-none overflow-hidden rounded-2xl border border-[#1b3622]/10 bg-[#f6f2e9] shadow-[0_24px_70px_-32px_rgba(27,54,34,0.4)] sm:h-[72vh] sm:min-h-[600px]"
      >
        {/* transformed world */}
        <div
          ref={contentRef}
          className="absolute left-0 top-0"
          style={{
            width: contentW,
            height: contentH,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {/* dot grid travels with the content */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(27,54,34,0.09) 1.1px, transparent 1.1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* generation rail */}
          <div
            className="pointer-events-none absolute w-px"
            style={{
              left: 44,
              top: (genYs[0]?.[1] ?? 0) + offsetY,
              height: Math.max(1, (genYs[genYs.length - 1]?.[1] ?? 0) - (genYs[0]?.[1] ?? 0)),
              background: "linear-gradient(180deg, rgba(27,54,34,0.02), rgba(27,54,34,0.16), rgba(27,54,34,0.02))",
              zIndex: 4,
            }}
          />
          {genYs.map(([gen, y]) => (
            <div
              key={gen}
              className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#1b3622]/12 bg-white shadow-[0_2px_6px_rgba(27,54,34,0.10)]"
              style={{ left: 44, top: y + offsetY, zIndex: 5 }}
              title={`Generation ${gen}`}
            >
              <span className="font-serif text-[10px] font-bold tracking-wide text-[#b8912e]">
                {romanNumeral(gen)}
              </span>
            </div>
          ))}

          {/* connectors */}
          <svg
            className="absolute inset-0 h-full w-full"
            style={{ pointerEvents: "none", zIndex: 1 }}
          >
            {links.map((link) => {
              const sx = (link.source.x ?? 0) + offsetX;
              const tx = (link.target.x ?? 0) + offsetX;
              const x1 = sx;
              const x2 = tx;
              const y1 = (link.source.y ?? 0) + offsetY + LINK_SRC_DY;
              const y2 = (link.target.y ?? 0) + offsetY - LINK_TGT_DY;
              const d = elbowPath(x1, y1, x2, y2);
              const branch = link.target.data.branchName;
              const stroke = branchColor(branch, map, 0.8);

              return (
                <g key={`lk-${link.target.data.id}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={5}
                    strokeLinecap="round"
                    opacity={0.12}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    opacity={0.72}
                    pathLength={1}
                    strokeDasharray={1}
                    className="[animation:ft-dash_0.7s_ease_forwards]"
                  />
                </g>
              );
            })}
          </svg>

          {/* nodes */}
          <AnimatePresence>
            {nodes.map((node) => {
              const left = (node.x ?? 0) + offsetX - coupleBlockWidth(node.data) / 2;
              const top = (node.y ?? 0) + offsetY;
              const dimmed = hasQuery && !node.data.isMatch && !node.data.spouseMatch;
              const isBranchHead = node.data.generation === 2 && node.data.branchName;

              return (
                <motion.div
                  key={node.data.id}
                  initial={{ opacity: 0, scale: 0.9, x: left, y: top }}
                  animate={{
                    opacity: dimmed ? 0.28 : 1,
                    scale: 1,
                    x: left,
                    y: top,
                  }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: coupleBlockWidth(node.data),
                    zIndex: node.data.isMatch || node.data.spouseMatch ? 30 : 10,
                  }}
                >
                  <div className="relative flex flex-col items-center" style={{ transform: "translateY(-50%)" }}>
                    {isBranchHead && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <div
                          className="flex items-center gap-1.5 rounded-full border bg-white/95 px-3 py-1 shadow-[0_3px_10px_rgba(27,54,34,0.10)] backdrop-blur"
                          style={{ borderColor: branchColor(node.data.branchName, map, 0.35) }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: branchColor(node.data.branchName, map, 1) }}
                          />
                          <span
                            className="font-serif text-[10px] font-bold uppercase tracking-[0.18em]"
                            style={{ color: branchColor(node.data.branchName, map, 0.95) }}
                          >
                            {node.data.branchName} Branch
                          </span>
                        </div>
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── floating overlays (fixed to viewport, not transformed) ── */}

        {/* stats */}
        <div className="absolute left-4 top-4 z-40 flex items-center gap-2 rounded-full border border-[#1b3622]/10 bg-white/85 px-3.5 py-1.5 shadow-[0_4px_14px_rgba(27,54,34,0.08)] backdrop-blur">
          <Users className="h-3.5 w-3.5 text-[#b8912e]" />
          <span className="text-[11px] font-semibold tracking-wide text-[#1b3622]/75">
            {stats.generations} {stats.generations === 1 ? "Generation" : "Generations"}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#1b3622]/20" />
          <span className="text-[11px] font-semibold tracking-wide text-[#1b3622]/75">
            {stats.members} Members
          </span>
        </div>

        {/* hint — touch wording on phones, pointer wording on desktop */}
        <div className="absolute bottom-4 left-4 z-40 hidden select-none text-[10px] font-medium uppercase tracking-[0.16em] text-[#1b3622]/35 sm:block">
          Drag to pan · Scroll to zoom
        </div>
        <div className="absolute bottom-4 left-4 z-40 select-none text-[10px] font-medium uppercase tracking-[0.16em] text-[#1b3622]/35 sm:hidden">
          Drag to pan · Pinch to zoom
        </div>

        {/* zoom toolbar */}
        <div className="absolute bottom-4 right-4 z-40 flex flex-col items-center gap-1 rounded-full border border-[#1b3622]/10 bg-white/95 p-1.5 shadow-[0_10px_30px_rgba(27,54,34,0.18)] backdrop-blur">
          <button
            onClick={() => zoomBy(1.3)}
            title="Zoom in"
            aria-label="Zoom in"
            className="grid h-11 w-11 place-items-center rounded-full text-[#1b3622]/70 transition hover:bg-[#1b3622]/6 hover:text-[#1b3622] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:h-9 sm:w-9"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => zoomBy(1 / 1.3)}
            title="Zoom out"
            aria-label="Zoom out"
            className="grid h-11 w-11 place-items-center rounded-full text-[#1b3622]/70 transition hover:bg-[#1b3622]/6 hover:text-[#1b3622] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:h-9 sm:w-9"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            title="Reset to 100%"
            className="grid h-11 min-w-[3.2rem] place-items-center rounded-full px-1.5 transition hover:bg-[#1b3622]/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:h-9"
          >
            <span ref={pctRef} className="text-[11px] font-bold tabular-nums text-[#1b3622]/75">
              100%
            </span>
          </button>
          <span className="h-px w-6 bg-[#1b3622]/10" />
          <button
            onClick={() => fitView(true, "center")}
            title="Fit tree to view"
            aria-label="Fit tree to view"
            className="grid h-11 w-11 place-items-center rounded-full text-[#1b3622]/70 transition hover:bg-[#1b3622]/6 hover:text-[#1b3622] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:h-9 sm:w-9"
          >
            <Scan className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="grid h-11 w-11 place-items-center rounded-full text-[#1b3622]/70 transition hover:bg-[#1b3622]/6 hover:text-[#1b3622] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:h-9 sm:w-9"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────  MAIN COMPONENT  ──────────────────────────── */

export default function FamilyTree({ members, rootId }: FamilyTreeProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const rootPerson = useMemo(() => members.find((m) => m.id === rootId), [members, rootId]);

  // Find all members who match the query
  const matchingMembers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return members.filter(
      (m) => m.name?.toLowerCase().includes(q) || m.bio?.toLowerCase().includes(q)
    );
  }, [members, query]);

  const matchKey = useMemo(
    () => matchingMembers.map((m) => m.id).sort().join(","),
    [matchingMembers]
  );

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

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set([rootId, ...Array.from(autoExpandedNodes)])
  );

  // Sync search-derived ancestors during render (proven pattern from v1)
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

  const expandAll = useCallback(() => {
    setExpandedNodes(new Set(members.map((member) => member.id)));
  }, [members]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set([rootId]));
  }, [rootId]);

  /* ---- build tree + accumulate branch stats in one pass ---- */
  const { treeData, branchCounts, totalVisible } = useMemo(() => {
    const counts: Record<string, number> = {};
    let visible = 0;
    if (!rootPerson) return { treeData: null, branchCounts: counts, totalVisible: 0 };

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
      const spouse = person.spouse_id
        ? memberById.get(person.spouse_id)
        : members.find((m) => m.spouse_id === personId);
      if (spouse) visited.add(spouse.id);

      const childrenById = new Map<string, Member>();
      [
        ...(childrenByParent.get(personId) || []),
        ...(spouse ? childrenByParent.get(spouse.id) || [] : []),
      ].forEach((child) => childrenById.set(child.id, child));
      const children = Array.from(childrenById.values());

      const isExpanded = expandedNodes.has(personId);
      const childNodes: TreeNode[] = [];

      if (isExpanded) {
        children.forEach((child) => {
          const childBranchName =
            generation === 1 ? child.name || "Unknown Branch" : branchName;
          const childNode = buildTree(child.id, generation + 1, new Set(visited), childBranchName);
          if (childNode) childNodes.push(childNode);
        });
      }

      if (branchName) {
        counts[branchName] = (counts[branchName] ?? 0) + 1 + (spouse ? 1 : 0);
      }
      visible += 1 + (spouse ? 1 : 0);

      return {
        id: personId,
        member: person,
        spouse,
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

    const data = buildTree(rootId, 1, new Set<string>());
    return { treeData: data, branchCounts: counts, totalVisible: visible };
  }, [rootId, members, expandedNodes, matchingMembers, rootPerson]);

  const branchToneMap = useMemo(() => getBranchToneMap(treeData), [treeData]);

  if (!rootPerson || !treeData) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[#1b3622]/10 bg-white px-8 py-12 text-center shadow-sm">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1b3622]/5">
          <Users className="h-6 w-6 text-[#1b3622]/40" />
        </span>
        <p className="font-serif text-lg text-[#1b3622]">Root ancestor record not found</p>
        <p className="text-sm text-[#1b3622]/50">
          The archive could not locate the founding member of this lineage.
        </p>
      </div>
    );
  }

  const generations = Math.max(
    ...(() => {
      let g = 1;
      const walk = (n: TreeNode) => {
        g = Math.max(g, n.generation);
        n.children.forEach(walk);
      };
      walk(treeData);
      return [g];
    })()
  );

  return (
    <div className="space-y-3">
      {/* control bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1b3622]/8 bg-white/85 px-4 py-3 shadow-[0_4px_16px_rgba(27,54,34,0.05)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <TreeLegend map={branchToneMap} counts={branchCounts} />
          {matchKey && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a6d1f]">
                {matchingMembers.length} {matchingMembers.length === 1 ? "match" : "matches"}
              </span>
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={collapseAll}
            className="cursor-pointer rounded-full border border-[#1b3622]/15 bg-white px-4 py-2.5 text-[11px] min-h-[40px] font-bold uppercase tracking-[0.12em] text-[#1b3622] transition-all duration-200 hover:border-[#1b3622]/35 hover:bg-[#fbf9f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
          >
            Collapse
          </button>
          <button
            type="button"
            onClick={expandAll}
            className="cursor-pointer rounded-full bg-[#1b3622] px-4 py-2.5 text-[11px] min-h-[40px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(27,54,34,0.25)] transition-all duration-200 hover:bg-[#2b5134] hover:shadow-[0_6px_18px_rgba(27,54,34,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
          >
            Expand all
          </button>
        </div>
      </div>

      {/* One responsive canvas for every viewport — pan/zoom with touch or
          pointer, fit-to-view, and fullscreen all work on phones too. */}
      <TreeCanvas
        treeData={treeData}
        toggleNode={toggleNode}
        map={branchToneMap}
        matchKey={matchKey}
        stats={{ generations, members: totalVisible }}
      />
    </div>
  );
}
