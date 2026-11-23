"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import type { LeafletKeyboardEvent, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { ILLUSTRATIVE_MIGRATION_CONNECTOR, JOURNEY_MILESTONES, JOURNEY_STAGE_LABELS, type JourneyStage } from "@/data/migrationJourney";

const STAGES: JourneyStage[] = ["arrival", "migration", "branches"];
const PRINCIPAL_BRANCHES = ["Pullazhiyil", "Thykurinjiyil", "Thanuvelil", "Poovathumparambil"] as const;
const STAGE_COLORS: Record<JourneyStage, string> = { arrival: "#b8912e", migration: "#1b3622", branches: "#766047" };
const TOUR_INTERVAL = 3800;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Small icon shared by the map overlay buttons. */
const controlClass =
  "press press-ink inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-[#1b3622]/20 bg-[#fbf9f4] px-3 text-xs font-semibold text-[#1b3622] shadow-md transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622]";

export default function MigrationJourneyMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef(new Map<string, { marker: LeafletMarker }>());
  const listRef = useRef<HTMLElement>(null);

  // Leaflet and its CSS are only pulled in once this section approaches the
  // viewport, so a visitor who never scrolls this far never pays for the map.
  const [nearViewport, setNearViewport] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [activeId, setActiveId] = useState("eruvallipra");
  const [stage, setStage] = useState<JourneyStage>("migration");
  const [activeBranch, setActiveBranch] = useState<(typeof PRINCIPAL_BRANCHES)[number] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wheelZoom, setWheelZoom] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);

  const activeIndex = useMemo(
    () => Math.max(0, JOURNEY_MILESTONES.findIndex((item) => item.id === activeId)),
    [activeId]
  );
  const active = JOURNEY_MILESTONES[activeIndex] ?? JOURNEY_MILESTONES[0];

  const shownMilestones = useMemo(
    () => JOURNEY_MILESTONES.filter((item) => {
      if (activeBranch) return item.branches?.some((branch) => branch === activeBranch || branch.startsWith(`${activeBranch}–`)) === true;
      if (stage === "branches") return item.stage === "branches" || Boolean(item.branches);
      return item.stage === stage;
    }),
    [activeBranch, stage],
  );

  const selectMilestone = useCallback((id: string, options: { fromTour?: boolean } = {}) => {
    const item = JOURNEY_MILESTONES.find((milestone) => milestone.id === id);
    if (!item) return;
    if (!options.fromTour) setIsPlaying(false);
    setActiveId(id);
    setStage(item.stage);
    setActiveBranch(null);
    mapRef.current?.flyTo(item.coordinates, Math.max(mapRef.current.getZoom(), 10), { duration: 0.75 });
  }, []);

  const stepMilestone = useCallback(
    (direction: -1 | 1) => {
      const next = Math.min(JOURNEY_MILESTONES.length - 1, Math.max(0, activeIndex + direction));
      selectMilestone(JOURNEY_MILESTONES[next].id);
    },
    [activeIndex, selectMilestone]
  );

  /* ── Lazy mount: start fetching Leaflet just before the atlas is reached ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || nearViewport) return;

    // Deep links (#migration-atlas-title) land here already scrolled to the
    // atlas, so check once synchronously before waiting for an observer tick.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 700 && rect.bottom > -700) {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nearViewport]);

  /* ── Guided tour: walks the whole journey, one place at a time ─────────── */
  useEffect(() => {
    if (!isPlaying) return;
    if (activeIndex >= JOURNEY_MILESTONES.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      const next = JOURNEY_MILESTONES[activeIndex + 1];
      setActiveId(next.id);
      setStage(next.stage);
      setActiveBranch(null);
      mapRef.current?.flyTo(next.coordinates, Math.max(mapRef.current.getZoom(), 10), { duration: 0.9 });
    }, TOUR_INTERVAL);
    return () => clearTimeout(timer);
  }, [isPlaying, activeIndex]);

  /* ── Keep the active place visible in the side list ────────────────────── */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector<HTMLElement>('[data-active="true"]');
    if (!activeEl) return;
    const target = activeEl.offsetTop - list.clientHeight / 2 + activeEl.clientHeight / 2;
    list.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [activeId, stage, activeBranch]);

  /* ── Boot Leaflet ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!nearViewport) return;
    let disposed = false;
    let map: LeafletMap | undefined;
    let resizeObserver: ResizeObserver | undefined;
    // Captured once so the cleanup never reads a ref whose value may have
    // changed while the map was alive.
    const markers = markerRefs.current;

    void import("leaflet")
      .then((L) => {
        if (disposed || !mapElement.current) return;
        map = L.map(mapElement.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          keyboard: true,
          preferCanvas: true,
        });
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.control.zoom({ position: "topright" }).addTo(map);

        const bounds = L.latLngBounds(JOURNEY_MILESTONES.map(({ coordinates }) => coordinates));
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 8 });

        JOURNEY_MILESTONES.forEach((item, index) => {
          const icon = L.divIcon({
            className: "heritage-map-marker-wrap",
            html: `<span class="heritage-map-marker heritage-map-marker--${item.stage}${
              item.id === "eruvallipra" ? " is-selected" : ""
            }" style="animation-delay:${120 + index * 45}ms" aria-hidden="true"></span>`,
            iconSize: [30, 38],
            iconAnchor: [15, 34],
          });
          const marker = L.marker(item.coordinates, {
            icon,
            title: item.name,
            alt: `${item.name}, ${JOURNEY_STAGE_LABELS[item.stage]}`,
            keyboard: true,
          }).addTo(map!);

          marker.bindTooltip(
            `<span class="heritage-map-tip__name">${item.name}</span><span class="heritage-map-tip__era">${item.era}</span>`,
            {
              direction: "top",
              offset: L.point(0, -26),
              className: "heritage-map-tip",
              opacity: 1,
            }
          );

          const markerElement = marker.getElement();
          markerElement?.setAttribute("role", "button");
          markerElement?.setAttribute(
            "aria-label",
            `${item.name}. ${JOURNEY_STAGE_LABELS[item.stage]}${item.precision === "approximate" ? ", approximate location" : ""}`
          );
          markerElement?.setAttribute("aria-pressed", String(item.id === "eruvallipra"));
          marker.on("click", () => selectMilestone(item.id));
          marker.on("keydown", (event: LeafletKeyboardEvent) => {
            if (event.originalEvent.key === "Enter" || event.originalEvent.key === " ") {
              event.originalEvent.preventDefault();
              selectMilestone(item.id);
            }
          });
          markerRefs.current.set(item.id, { marker });
        });
        L.polyline(ILLUSTRATIVE_MIGRATION_CONNECTOR, {
          color: "#b8912e",
          weight: 3,
          opacity: 0.9,
          dashArray: "5 9",
          lineCap: "round",
        })
          .bindTooltip("Illustrative geographic connection only — not an evidenced itinerary")
          .addTo(map);

        resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
        resizeObserver.observe(mapElement.current);
        setMapReady(true);
      })
      .catch((error: unknown) => {
        if (disposed) return;
        console.error("[History atlas] The map could not initialise:", error);
        setMapFailed(true);
        // The narrative, timeline and place list remain fully available if map JS fails.
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, [nearViewport, selectMilestone]);

  /* ── Sync the selected pin ────────────────────────────────────────────── */
  useEffect(() => {
    for (const item of JOURNEY_MILESTONES) {
      const entry = markerRefs.current.get(item.id);
      if (!entry) continue;
      const markerElement = entry.marker.getElement();
      markerElement?.setAttribute("aria-pressed", String(item.id === activeId));
      markerElement?.querySelector(".heritage-map-marker")?.classList.toggle("is-selected", item.id === activeId);
      // Only the active pin keeps its label open; stale tooltips from the
      // previous stop used to linger after the tour moved on.
      if (mapReady && item.id !== activeId) entry.marker.closeTooltip();
    }
    if (activeId && mapReady) markerRefs.current.get(activeId)?.marker.openTooltip();
  }, [activeId, mapReady]);

  /* ── Optional wheel zoom (off by default so the page never traps scroll) ─ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (wheelZoom) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [wheelZoom, mapReady]);

  const resetMap = () => {
    if (!mapRef.current) return;
    mapRef.current.fitBounds(JOURNEY_MILESTONES.map(({ coordinates }) => coordinates), {
      padding: [32, 32],
      maxZoom: 8,
      animate: true,
    });
  };

  const chooseStage = (item: JourneyStage) => {
    setIsPlaying(false);
    setActiveBranch(null);
    setStage(item);
    const first = JOURNEY_MILESTONES.find((milestone) => milestone.stage === item);
    if (first) selectMilestone(first.id);
  };

  const chooseBranch = (branch: (typeof PRINCIPAL_BRANCHES)[number] | null) => {
    setIsPlaying(false);
    setStage("branches");
    setActiveBranch(branch);
    if (!branch) return;
    const first = JOURNEY_MILESTONES.find(
      (item) => item.stage === "branches" && item.branches?.some((name) => name === branch || name.startsWith(`${branch}–`))
    );
    if (first) selectMilestone(first.id);
  };

  const osmHref = `https://www.openstreetmap.org/?mlat=${active.coordinates[0]}&mlon=${active.coordinates[1]}#map=13/${active.coordinates[0]}/${active.coordinates[1]}`;
  const stageLabel = JOURNEY_STAGE_LABELS[active.stage].replace(/^\d+ · /, "");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="migration-atlas-title"
      className="relative z-10 mx-auto mt-24 max-w-7xl px-5 sm:px-8 lg:px-16"
    >
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a0f]">An interactive family atlas</p>
        <h2 id="migration-atlas-title" className="scroll-mt-24 font-serif text-3xl leading-tight text-[#1b3622] sm:text-4xl">Across the Kerala landscape</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#3d443f]">Explore three distinct chapters: a community arrival preserved in Knanaya tradition, a later family migration, and the settlements named in our family history.</p>
      </header>

      <div className="mb-5 flex flex-wrap justify-center gap-2" aria-label="Historical stages">
        {STAGES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => chooseStage(item)}
            aria-pressed={stage === item}
            className={`press press-ink min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${
              stage === item
                ? "border-[#1b3622] bg-[#1b3622] text-white"
                : "border-[#1b3622]/20 bg-white/80 text-[#1b3622] hover:bg-[#1b3622]/5"
            }`}
          >
            {JOURNEY_STAGE_LABELS[item]}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap justify-center gap-2" role="group" aria-label="Explore the principal family branches">
        <button
          type="button"
          onClick={() => chooseBranch(null)}
          aria-pressed={stage === "branches" && activeBranch === null}
          className={`press press-ink min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${
            stage === "branches" && activeBranch === null
              ? "border-[#1b3622] bg-[#1b3622] text-white"
              : "border-[#1b3622]/20 bg-white/80 text-[#1b3622] hover:bg-[#1b3622]/5"
          }`}
        >
          All settlements
        </button>
        {PRINCIPAL_BRANCHES.map((branch) => (
          <button
            key={branch}
            type="button"
            onClick={() => chooseBranch(branch)}
            aria-pressed={stage === "branches" && activeBranch === branch}
            className={`press press-ink min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${
              stage === "branches" && activeBranch === branch
                ? "border-[#b8912e] bg-[#b8912e]/15 text-[#1b3622]"
                : "border-[#1b3622]/20 bg-white/80 text-[#1b3622] hover:bg-[#1b3622]/5"
            }`}
          >
            {branch}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-sm border border-[#1b3622]/15 bg-[#f2eddf] shadow-[0_18px_55px_-35px_rgba(27,54,34,0.55)]">
        <div className="relative">
          <div
            ref={mapElement}
            className="heritage-map-canvas h-[360px] w-full sm:h-[440px] lg:h-[520px]"
            role="region"
            aria-label="Interactive map of historical family locations"
          />

          {!mapReady && !mapFailed && (
            <div className="pointer-events-none absolute inset-0 z-[300] grid place-items-center bg-[#eee8da]/85">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1b3622]/10 bg-[#fbf9f4]/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1b3622]/70 shadow-sm">
                <span className="loader-mark" aria-hidden />
                Drawing the family atlas
              </span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-[500] flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2">
            <button type="button" onClick={resetMap} className={controlClass} aria-label="Fit all places on the map">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Fit all places
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              aria-pressed={isPlaying}
              className={`${controlClass} ${isPlaying ? "border-[#b8912e]/70 bg-[#b8912e]/15" : ""}`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
              {isPlaying ? "Pause journey" : "Play journey"}
            </button>
            <button
              type="button"
              onClick={() => setWheelZoom((value) => !value)}
              aria-pressed={wheelZoom}
              className={`${controlClass} ${wheelZoom ? "border-[#1b3622]/60" : ""}`}
              title="Enable zooming the map with the mouse wheel"
            >
              Scroll zoom {wheelZoom ? "on" : "off"}
            </button>
          </div>

          <div className="absolute left-4 top-4 z-[400] max-w-[220px] rounded-sm border border-[#1b3622]/10 bg-[#fbf9f4]/95 px-3 py-2 text-xs text-[#303a32] shadow-sm">
            <button
              type="button"
              onClick={() => setLegendOpen((open) => !open)}
              aria-expanded={legendOpen}
              className="flex w-full items-center justify-between gap-2 font-semibold uppercase tracking-wider"
            >
              Map key
              <span aria-hidden className="text-[10px] text-[#8a6a0f]">{legendOpen ? "−" : "+"}</span>
            </button>
            {legendOpen && (
              <ul className="mt-1 space-y-1">
                {STAGES.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full border border-white shadow" style={{ backgroundColor: STAGE_COLORS[item] }} />
                    {JOURNEY_STAGE_LABELS[item].replace(/^\d+ · /, "")}
                  </li>
                ))}
                <li className="flex items-center gap-2"><span className="w-3 border-t-2 border-dashed border-[#b8912e]" />Illustrative connection</li>
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-0 bg-[#fbf9f4] lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
          <div aria-live="polite" aria-atomic="true" className="min-w-0 border-b border-[#1b3622]/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8a6a0f]">
                  {stageLabel}
                  {active.precision === "approximate" ? " · Approximate" : ""}
                </p>
                <span className="shrink-0 font-mono text-[11px] tabular text-[#6c6252]" aria-hidden>
                  {String(activeIndex + 1).padStart(2, "0")} / {JOURNEY_MILESTONES.length}
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-[#1b3622]">{active.name}</h3>
              <p className="mt-1 text-sm font-semibold text-[#52584f]">{active.era}</p>
              <p className="mt-4 text-[15px] leading-7 text-[#343a35]">{active.note}</p>
              {active.branches && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#1b3622]">Branches named at this settlement</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {active.branches.map((branch) => (
                      <li key={branch} className="rounded-full border border-[#1b3622]/15 bg-white px-3 py-1.5 text-sm text-[#1b3622]">{branch}</li>
                    ))}
                  </ul>
                </div>
              )}
              {active.image ? (
                <figure className="mt-5 grid grid-cols-[92px_1fr] items-center gap-3">
                  <Image
                    src={active.image.src}
                    alt={active.image.alt}
                    width={368}
                    height={245}
                    sizes="92px"
                    loading="lazy"
                    className="h-20 w-[92px] rounded-sm border border-[#1b3622]/10 object-cover"
                  />
                  <figcaption className="text-sm leading-6 text-[#5a6059]">Existing image from the family-history archive. Illustrative context, not a documentary photograph of the event.</figcaption>
                </figure>
              ) : (
                <figure className="mt-5 grid grid-cols-[92px_1fr] items-center gap-3">
                  <div role="img" aria-label="No verified archive photograph available for this location" className="flex h-20 w-[92px] flex-col items-center justify-center rounded-sm border border-dashed border-[#1b3622]/25 bg-[#f2eddf] px-2 text-center">
                    <span className="font-mono text-[9px] font-semibold tracking-wider text-[#8a6a0f]">ARCHIVE</span>
                    <span className="mt-1 text-[10px] leading-3 text-[#515850]">No verified photo</span>
                  </div>
                  <figcaption className="text-sm leading-6 text-[#5a6059]">No suitable family photograph is currently documented for this place.</figcaption>
                </figure>
              )}
              <p className="mt-4 border-t border-[#1b3622]/10 pt-3 text-xs leading-5 text-[#545b55]">{active.source}</p>
            </motion.div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => stepMilestone(-1)}
                disabled={activeIndex === 0}
                className="press press-ink inline-flex min-h-11 items-center gap-1 rounded-sm border border-[#1b3622]/20 px-3 text-sm font-semibold text-[#1b3622] transition-colors hover:border-[#1b3622]/50 hover:bg-[#1b3622]/5 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous place
              </button>
              <button
                type="button"
                onClick={() => stepMilestone(1)}
                disabled={activeIndex >= JOURNEY_MILESTONES.length - 1}
                className="press press-ink inline-flex min-h-11 items-center gap-1 rounded-sm border border-[#1b3622]/20 px-3 text-sm font-semibold text-[#1b3622] transition-colors hover:border-[#1b3622]/50 hover:bg-[#1b3622]/5 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622]"
              >
                Next place
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
              <Link
                href="/tree"
                className="press press-ink inline-flex min-h-11 items-center rounded-sm border border-[#1b3622]/20 px-4 text-sm font-semibold text-[#1b3622] transition-colors hover:border-[#1b3622]/50 hover:bg-[#1b3622]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622]"
              >
                Explore the family tree <span aria-hidden className="ml-2">→</span>
              </Link>
              <a
                href={osmHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-[#8a6a0f] underline decoration-[#8a6a0f]/30 underline-offset-4 transition-colors hover:text-[#1b3622] hover:decoration-[#1b3622]/50"
              >
                Open in OpenStreetMap
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </div>

          <nav ref={listRef} aria-label={`${activeBranch ? `${activeBranch} branch` : JOURNEY_STAGE_LABELS[stage]} locations`} className="relative max-h-[380px] overflow-y-auto p-4 sm:p-5">
            <h3 className="mb-3 font-serif text-lg text-[#1b3622]">
              {activeBranch ? `${activeBranch} branch places` : stage === "arrival" ? "Community arrival" : stage === "migration" ? "Later migration" : "Settlements in the history"}
            </h3>
            <ol className="space-y-2">
              {shownMilestones.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectMilestone(item.id)}
                    data-active={activeId === item.id}
                    aria-current={activeId === item.id ? "location" : undefined}
                    className={`press press-ink flex min-h-11 w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b3622] ${
                      activeId === item.id
                        ? "border-[#b8912e]/60 bg-[#b8912e]/10"
                        : "border-transparent hover:border-[#1b3622]/10 hover:bg-white"
                    }`}
                  >
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STAGE_COLORS[item.stage] }} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#1b3622]">
                        {item.name}
                        {item.precision === "approximate" && <span className="ml-1 text-xs font-normal text-[#6c6252]">(approx.)</span>}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[#5a6059]">{item.era}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-4xl text-center text-xs leading-5 text-[#515850]">The A.D. 345 arrival and eighteenth-century family migration are separate historical stages; no route connects them. The dashed river-to-settlement connector is an approximate illustration based on family tradition and modern mapped geography—not an evidenced itinerary. Pins mark modern localities, not ancestral homes. OpenStreetMap map tiles &copy; OpenStreetMap contributors.</p>
      <noscript><p className="mt-4 text-center text-sm">Map interactions require JavaScript. The historical narrative and location list remain available when scripting is disabled.</p></noscript>
    </section>
  );
}
