"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LeafletKeyboardEvent, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { ILLUSTRATIVE_MIGRATION_CONNECTOR, JOURNEY_MILESTONES, JOURNEY_STAGE_LABELS, type JourneyStage } from "@/data/migrationJourney";

const STAGES: JourneyStage[] = ["arrival", "migration", "branches"];
const PRINCIPAL_BRANCHES = ["Pullazhiyil", "Thykurinjiyil", "Thanuvelil", "Poovathumparambil"] as const;
const STAGE_COLORS: Record<JourneyStage, string> = { arrival: "#b8912e", migration: "#1b3622", branches: "#766047" };

export default function MigrationJourneyMap() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef(new Map<string, { marker: LeafletMarker }>());
  const [activeId, setActiveId] = useState("iruvallipra");
  const [stage, setStage] = useState<JourneyStage>("migration");
  const [activeBranch, setActiveBranch] = useState<(typeof PRINCIPAL_BRANCHES)[number] | null>(null);
  const active = useMemo(() => JOURNEY_MILESTONES.find((item) => item.id === activeId) ?? JOURNEY_MILESTONES[0], [activeId]);
  const shownMilestones = useMemo(
    () => JOURNEY_MILESTONES.filter((item) => {
      if (activeBranch) return item.branches?.some((branch) => branch === activeBranch || branch.startsWith(`${activeBranch}–`)) === true;
      if (stage === "branches") return item.stage === "branches" || Boolean(item.branches);
      return item.stage === stage;
    }),
    [activeBranch, stage],
  );

  const selectMilestone = useCallback((id: string) => {
    const item = JOURNEY_MILESTONES.find((milestone) => milestone.id === id);
    if (!item) return;
    setActiveId(id);
    setStage(item.stage);
    setActiveBranch(null);
    mapRef.current?.flyTo(item.coordinates, Math.max(mapRef.current.getZoom(), 10), { duration: 0.65 });
  }, []);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let resizeObserver: ResizeObserver | undefined;
    void import("leaflet").then((L) => {
      if (disposed || !mapElement.current) return;
      map = L.map(mapElement.current, { zoomControl: false, scrollWheelZoom: false, keyboard: true, preferCanvas: true });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      const bounds = L.latLngBounds(JOURNEY_MILESTONES.map(({ coordinates }) => coordinates));
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 8 });
      for (const item of JOURNEY_MILESTONES) {
        const icon = L.divIcon({
          className: "heritage-map-marker-wrap",
          html: `<span class="heritage-map-marker heritage-map-marker--${item.stage}${item.id === "iruvallipra" ? " is-selected" : ""}" aria-hidden="true"></span>`,
          iconSize: [30, 38],
          iconAnchor: [15, 34],
        });
        const marker = L.marker(item.coordinates, { icon, title: item.name, alt: `${item.name}, ${JOURNEY_STAGE_LABELS[item.stage]}`, keyboard: true }).addTo(map);
        const markerElement = marker.getElement();
        markerElement?.setAttribute("role", "button");
        markerElement?.setAttribute("aria-label", `${item.name}. ${JOURNEY_STAGE_LABELS[item.stage]}${item.precision === "approximate" ? ", approximate location" : ""}`);
        markerElement?.setAttribute("aria-pressed", String(item.id === "iruvallipra"));
        marker.on("click", () => {
          setActiveId(item.id);
          setStage(item.stage);
          setActiveBranch(null);
        });
        marker.on("keydown", (event: LeafletKeyboardEvent) => {
          if (event.originalEvent.key === "Enter" || event.originalEvent.key === " ") {
            setActiveBranch(null);
            selectMilestone(item.id);
          }
        });
        markerRefs.current.set(item.id, { marker });
      }
      L.polyline(ILLUSTRATIVE_MIGRATION_CONNECTOR, { color: "#b8912e", weight: 3, opacity: 0.9, dashArray: "5 9", lineCap: "round" })
        .bindTooltip("Illustrative geographic connection only — not an evidenced itinerary")
        .addTo(map);
      resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
      resizeObserver.observe(mapElement.current);
    }).catch(() => {
      // The narrative, timeline and place list remain fully available if map JS fails.
    });
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, [selectMilestone]);

  useEffect(() => {
    for (const item of JOURNEY_MILESTONES) {
      const entry = markerRefs.current.get(item.id);
      if (!entry) continue;
      const markerElement = entry.marker.getElement();
      markerElement?.setAttribute("aria-pressed", String(item.id === activeId));
      markerElement?.querySelector(".heritage-map-marker")?.classList.toggle("is-selected", item.id === activeId);
    }
  }, [activeId]);

  const resetMap = () => {
    if (!mapRef.current) return;
    mapRef.current.fitBounds(JOURNEY_MILESTONES.map(({ coordinates }) => coordinates), { padding: [32, 32], maxZoom: 8, animate: true });
  };

  return (
    <section aria-labelledby="migration-atlas-title" className="relative z-10 mx-auto mt-24 max-w-7xl px-5 sm:px-8 lg:px-16">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a0f]">An interactive family atlas</p>
        <h2 id="migration-atlas-title" className="font-serif text-3xl leading-tight text-[#1b3622] sm:text-4xl">Across the Kerala landscape</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#3d443f]">Explore three distinct chapters: a community arrival preserved in Knanaya tradition, a later family migration, and the settlements named in our family history.</p>
      </header>

      <div className="mb-5 flex flex-wrap justify-center gap-2" aria-label="Historical stages">
        {STAGES.map((item) => (
          <button key={item} type="button" onClick={() => { setActiveBranch(null); setStage(item); const first = JOURNEY_MILESTONES.find((milestone) => milestone.stage === item); if (first) selectMilestone(first.id); }} aria-pressed={stage === item} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${stage === item ? "border-[#1b3622] bg-[#1b3622] text-white" : "border-[#1b3622]/20 bg-white/80 text-[#1b3622] hover:bg-[#1b3622]/5"}`}>
            {JOURNEY_STAGE_LABELS[item]}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap justify-center gap-2" role="group" aria-label="Explore the principal family branches">
        <button type="button" onClick={() => { setStage("branches"); setActiveBranch(null); }} aria-pressed={stage === "branches" && activeBranch === null} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${stage === "branches" && activeBranch === null ? "border-[#1b3622] bg-[#1b3622] text-white" : "border-[#1b3622]/20 bg-white/80 text-[#1b3622] hover:bg-[#1b3622]/5"}`}>
          All settlements
        </button>
        {PRINCIPAL_BRANCHES.map((branch) => (
          <button key={branch} type="button" onClick={() => {
            const first = JOURNEY_MILESTONES.find((item) => item.stage === "branches" && item.branches?.some((name) => name === branch || name.startsWith(`${branch}–`)));
            setStage("branches");
            setActiveBranch(branch);
            if (first) {
              setActiveId(first.id);
              mapRef.current?.flyTo(first.coordinates, Math.max(mapRef.current.getZoom(), 10), { duration: 0.65 });
            }
          }} aria-pressed={stage === "branches" && activeBranch === branch} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${stage === "branches" && activeBranch === branch ? "border-[#b8912e] bg-[#b8912e]/15 text-[#1b3622]" : "border-[#1b3622]/20 bg-white/80 text-[#1b3622] hover:bg-[#1b3622]/5"}`}>
            {branch}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-sm border border-[#1b3622]/15 bg-[#f2eddf] shadow-[0_18px_55px_-35px_rgba(27,54,34,0.55)]">
        <div className="relative">
          <div ref={mapElement} className="heritage-map-canvas h-[360px] w-full sm:h-[440px] lg:h-[520px]" role="region" aria-label="Interactive map of historical family locations" />
          <button type="button" onClick={resetMap} className="absolute bottom-4 left-4 z-[500] min-h-11 rounded-sm border border-[#1b3622]/20 bg-[#fbf9f4] px-4 text-sm font-semibold text-[#1b3622] shadow-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622]">Fit all places</button>
          <div className="absolute left-4 top-4 z-[400] rounded-sm border border-[#1b3622]/10 bg-[#fbf9f4]/95 px-3 py-2 text-xs text-[#303a32] shadow-sm" aria-label="Map legend">
            <p className="mb-1 font-semibold uppercase tracking-wider">Map key</p>
            <ul className="space-y-1">
              {STAGES.map((item) => <li key={item} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-white shadow" style={{ backgroundColor: STAGE_COLORS[item] }} />{JOURNEY_STAGE_LABELS[item].replace(/^\d+ · /, "")}</li>)}
              <li className="flex items-center gap-2"><span className="w-3 border-t-2 border-dashed border-[#b8912e]" />Illustrative connection</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-0 bg-[#fbf9f4] lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
          <article aria-live="polite" aria-atomic="true" className="min-w-0 border-b border-[#1b3622]/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8a6a0f]">{JOURNEY_STAGE_LABELS[active.stage]}{active.precision === "approximate" ? " · Approximate location" : ""}</p>
            <h3 className="mt-2 font-serif text-2xl text-[#1b3622]">{active.name}</h3>
            <p className="mt-1 text-sm font-semibold text-[#52584f]">{active.era}</p>
            <p className="mt-4 text-[15px] leading-7 text-[#343a35]">{active.note}</p>
            {active.branches && <div className="mt-4"><p className="text-sm font-semibold text-[#1b3622]">Branches named at this settlement</p><ul className="mt-2 flex flex-wrap gap-2">{active.branches.map((branch) => <li key={branch} className="rounded-full border border-[#1b3622]/15 bg-white px-3 py-1.5 text-sm text-[#1b3622]">{branch}</li>)}</ul></div>}
            {active.image ? <figure className="mt-5 grid grid-cols-[92px_1fr] items-center gap-3"><Image src={active.image.src} alt={active.image.alt} width={368} height={245} loading="lazy" className="h-20 w-[92px] rounded-sm border border-[#1b3622]/10 object-cover"/><figcaption className="text-sm leading-6 text-[#5a6059]">Existing image from the family-history archive. Illustrative context, not a documentary photograph of the event.</figcaption></figure> : <figure className="mt-5 grid grid-cols-[92px_1fr] items-center gap-3"><div role="img" aria-label="No verified archive photograph available for this location" className="flex h-20 w-[92px] flex-col items-center justify-center rounded-sm border border-dashed border-[#1b3622]/25 bg-[#f2eddf] px-2 text-center"><span className="font-mono text-[9px] font-semibold tracking-wider text-[#8a6a0f]">ARCHIVE</span><span className="mt-1 text-[10px] leading-3 text-[#515850]">No verified photo</span></div><figcaption className="text-sm leading-6 text-[#5a6059]">No suitable family photograph is currently documented for this place.</figcaption></figure>}
            <p className="mt-4 border-t border-[#1b3622]/10 pt-3 text-xs leading-5 text-[#545b55]">{active.source}</p>
            <Link href="/tree" className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-[#1b3622]/20 px-4 text-sm font-semibold text-[#1b3622] transition-colors hover:border-[#1b3622]/50 hover:bg-[#1b3622]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622]">Explore the family tree <span aria-hidden="true" className="ml-2">→</span></Link>
          </article>

          <nav aria-label={`${activeBranch ? `${activeBranch} branch` : JOURNEY_STAGE_LABELS[stage]} locations`} className="max-h-[380px] overflow-y-auto p-4 sm:p-5">
            <h3 className="mb-3 font-serif text-lg text-[#1b3622]">{activeBranch ? `${activeBranch} branch places` : stage === "arrival" ? "Community arrival" : stage === "migration" ? "Later migration" : "Settlements in the history"}</h3>
            <ol className="space-y-2">
              {shownMilestones.map((item) => <li key={item.id}><button type="button" onClick={() => selectMilestone(item.id)} aria-current={activeId === item.id ? "location" : undefined} className={`flex min-h-11 w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${activeId === item.id ? "border-[#b8912e]/60 bg-[#b8912e]/10" : "border-transparent hover:border-[#1b3622]/10 hover:bg-white"}`}><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STAGE_COLORS[item.stage] }} /><span><span className="block text-sm font-semibold text-[#1b3622]">{item.name}{item.precision === "approximate" && <span className="ml-1 text-xs font-normal text-[#6c6252]">(approx.)</span>}</span><span className="mt-0.5 block text-xs leading-5 text-[#5a6059]">{item.era}</span></span></button></li>)}
            </ol>
          </nav>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-4xl text-center text-xs leading-5 text-[#515850]">The A.D. 345 arrival and eighteenth-century family migration are separate historical stages; no route connects them. The dashed river-to-settlement connector is an approximate illustration based on family tradition and modern mapped geography—not an evidenced itinerary. Pins mark modern localities, not ancestral homes. OpenStreetMap map tiles &copy; OpenStreetMap contributors.</p>
      <noscript><p className="mt-4 text-center text-sm">Map interactions require JavaScript. The historical narrative and location list remain available when scripting is disabled.</p></noscript>
    </section>
  );
}
