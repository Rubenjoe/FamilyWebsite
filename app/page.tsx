"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Calendar, ArrowRight, MapPin, ShieldCheck, Landmark, Globe, Award } from "lucide-react";
import { MOCK_MEMBERS, MOCK_EVENTS, MOCK_TIMELINE } from "../data/mockData";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineItem {
  era: string;
  title: string;
  location: string;
  desc: string;
  authority: string;
}

interface Pillar {
  num: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

const CENTENNIAL_TIMELINE: TimelineItem[] = [
  {
    era: "1924",
    title: "The Courtyard Assembly",
    location: "Thrissur Core",
    desc: "The foundational family patriarchs gathered beneath the central porch courtyard to sign the initial collective land registry deed, establishing our institutional roots.",
    authority: "Registry Volume I",
  },
  {
    era: "1952",
    title: "The Written Constitution",
    location: "Kerala State",
    desc: "Formalization of the Kudumbayogam charter. A structured welfare frame and educational loan protocol were codified to support downstream generations.",
    authority: "Governance Act",
  },
  {
    era: "1978",
    title: "The Diaspora Vanguard",
    location: "Global Network",
    desc: "First major wave of international migration. Regional liaison desks established in Mumbai, Chennai, and the Gulf to keep separated families bound to the lineage.",
    authority: "Liaison Records",
  },
  {
    era: "1999",
    title: "The Platinum Smaranika",
    location: "Thrissur",
    desc: "A monumental print compilation tracking 75 years of unbroken ancestral lines, archival portraits, and historical charts published in a limited edition volume.",
    authority: "Heritage Print",
  },
  {
    era: "2012",
    title: "Digital Registry Genesis",
    location: "Cloud Nodes",
    desc: "Transitioning traditional paper ledgers into encrypted relational database matrices, allowing cross-border family tree parsing securely.",
    authority: "Archival System",
  },
  {
    era: "2024",
    title: "The Centennial Jubilee",
    location: "Ancestral House",
    desc: "Marking 100 continuous years of assemblies with global philanthropic endowments, structural heritage restorations, and ancestral convergence.",
    authority: "Centenary Decree",
  },
];

const HERITAGE_PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Lineage Authentication",
    desc: "Enforcing rigorous verification standards to register births, unions, and lineage extensions across global coordinate points safely.",
    icon: ShieldCheck,
  },
  {
    num: "02",
    title: "Sovereign Endowments",
    desc: "Sponsoring advanced scholarship tracks and healthcare allocations for lower-income family pools within our sub-branches.",
    icon: Landmark,
  },
  {
    num: "03",
    title: "Historical Repositories",
    desc: "Preserving ancient land deeds, vintage media registries, and jubilee sovereign volumes inside a centralized cloud vault.",
    icon: Globe,
  },
  {
    num: "04",
    title: "Global Convergence",
    desc: "Sustaining uniform assembly intervals, local chapters, and family group reunions to ensure community continuity.",
    icon: Award,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const HERO_IMAGES = [
  "/images/hero1.jpeg",
  "/images/hero2.jpeg",
  "/images/hero3.jpeg",
];

export default function Home() {
  const totalMembers = MOCK_MEMBERS.length + 446;
  const upcomingEvents = MOCK_EVENTS.filter((e) => e.status === "upcoming");
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Section refs
  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  // ── 1. Hero scroll transforms ──────────────────────────────────────────────
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, -120]);
  // FIX: spring-smooth the opacity so it doesn't snap harshly
  const heroOpacityRaw = useTransform(heroScroll, [0, 0.65], [1, 0]);
  const heroOpacity = useSpring(heroOpacityRaw, { stiffness: 80, damping: 20 });
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.95]);

  // ── 2. Info section scroll transforms ─────────────────────────────────────
  const { scrollYProgress: infoScroll } = useScroll({
    target: infoRef,
    offset: ["start end", "end start"],
  });
  // FIX: scaleX expects 0–1, not "0%"–"100%" strings
  const infoLineScale = useTransform(infoScroll, [0.1, 0.45], [0, 1]);
  const infoTextY = useTransform(infoScroll, [0.1, 0.4], [40, 0]);
  const infoTextOpacity = useTransform(infoScroll, [0.1, 0.4], [0, 1]);

  // ── 3. Pinned horizontal timeline ─────────────────────────────────────────
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: pinSectionRef,
  });
  // FIX: changed range so first card is fully visible at start (was "0%", should be offset)
  const xTrackTranslation = useTransform(
    horizontalProgress,
    [0.05, 0.95],
    ["0%", "-72%"]
  );
  const timelineProgressLine = useTransform(horizontalProgress, [0.05, 0.95], [0, 1]);
  // FIX: smooth the progress line with a spring so it doesn't stutter
  const timelineProgressSpring = useSpring(timelineProgressLine, {
    stiffness: 100,
    damping: 30,
  });

  // ── 4. Pillars scroll transforms ──────────────────────────────────────────
  const { scrollYProgress: pillarsScroll } = useScroll({
    target: pillarsRef,
    offset: ["start end", "end start"],
  });
  // FIX: was computed but never used — now drives a top border animation on the section heading
  const pillarsHeadingOpacity = useTransform(pillarsScroll, [0.05, 0.25], [0, 1]);
  const pillarsHeadingY = useTransform(pillarsScroll, [0.05, 0.25], [30, 0]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#fbf9f4] text-[#1b3622] min-h-screen pb-32 selection:bg-[#1b3622] selection:text-[#fbf9f4]">

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative h-[95vh] flex flex-col justify-center px-6 md:px-12 lg:px-20 border-b border-[#1b3622]/10 text-[#fbf9f4]"
        style={{ overflow: "hidden" }}
      >
        {/* Background Slideshow */}
        {HERO_IMAGES.map((img, index) => (
          <motion.div
            key={img}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentHeroImage === index ? 1 : 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* Dark overlay to keep text readable against images */}
        <div className="absolute inset-0 z-0 bg-[#1b3622]/70" />

        {/* Dot grid — moved to a pseudo-element equivalent via a div so it doesn't affect layout */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045] z-0"
          style={{ backgroundImage: "radial-gradient(#d4af37 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        {/* Subtle ambient glow in top-right corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full z-0"
          style={{ background: "radial-gradient(circle, #d4af3715 0%, transparent 65%)" }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="max-w-6xl w-full mx-auto space-y-12 relative z-10"
        >
          {/* Eyebrow */}
          <div className="overflow-hidden h-6 flex items-center">
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: NORELL_EASE }}
              className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#d4af37] font-semibold block"
            >
              Onich Onayi Munnot &bull;
            </motion.span>
          </div>

          {/* Display headline */}
          {/* Display headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light font-serif tracking-tight leading-[0.9]">
            <div className="overflow-hidden py-1">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.1, ease: NORELL_EASE }}
              >
                Pullazhiyil
              </motion.span>
            </div>

            <div className="overflow-hidden py-1">
              <motion.span
                className="block italic font-normal text-[#d4af37]"
                initial={{ y: "50%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: NORELL_EASE }}
              >
                Kudumbayogam
              </motion.span>
            </div>
          </h1>
          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, delay: 0.35, ease: NORELL_EASE }}
            className="w-full h-px bg-[#fbf9f4]/20 origin-left"
          />

          {/* Bottom row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: NORELL_EASE }}
            >
              <p className="text-sm md:text-lg lg:text-xl tracking-[0.25em] uppercase text-[#fbf9f4]/70 font-mono">
                Thanuvelil &bull; Thaikurinjiyil &bull; Poovathumparambil &bull; Thoppil &bull; Thaiparambil &bull; Kollupra &bull;
              </p>
            </motion.div>

            <motion.div
              className="md:col-span-5 md:text-right"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: NORELL_EASE }}
            >
              <Link
                href="/tree"
                className="group inline-flex items-center gap-3 bg-[#d4af37] text-[#1b3622] text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#fbf9f4] transition-all duration-500 shadow-xl"
              >
                <span>Enter Archive Matrix</span>
                <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-[#fbf9f4]/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-[#d4af37]/50 to-transparent"
          />
        </motion.div>
      </div>

      {/* ── 2. METRICS STRIP ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-24">
        <div className="w-full h-px bg-[#1b3622]/10" />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1b3622]/10 py-12">
          {[
            { value: `${totalMembers}+`, label: "Registered Members" },
            { value: 3, label: "Tracked Generations" },
            { value: MOCK_TIMELINE.length, label: "Recorded Eras" },
            { value: "1924", label: "Founding Anchor" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: NORELL_EASE }}
              className="pl-6 first:pl-0 space-y-1"
            >
              <span className="block text-3xl md:text-5xl font-serif font-light text-[#1b3622]">
                {stat.value}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 block font-mono">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="w-full h-px bg-[#1b3622]/10" />
      </section>

      {/* ── 3. IDENTITY PANEL ────────────────────────────────────────────────── */}
      <section ref={infoRef} className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-32 space-y-10">
        {/* FIX: scaleX now uses 0–1 numeric range */}
        <motion.div
          style={{ scaleX: infoLineScale }}
          className="w-full h-px bg-[#d4af37] origin-left"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <motion.span
              style={{ opacity: infoTextOpacity }}
              className="text-[10px] tracking-[0.3em] uppercase font-mono text-[#d4af37] block mb-2"
            >
              Identity Statement
            </motion.span>
            <motion.h2
              style={{ y: infoTextY, opacity: infoTextOpacity }}
              className="text-3xl md:text-4xl font-serif font-light text-[#1b3622] leading-tight"
            >
              An Immutable Custodian of Kinship.
            </motion.h2>
          </div>

          <div className="md:col-span-7">
            <motion.p
              style={{ y: infoTextY, opacity: infoTextOpacity }}
              className="text-gray-600 font-light text-sm md:text-base leading-relaxed max-w-2xl"
            >
              The Pulazhiyil Kudumbayogam is more than an assembly; it is a live institutional
              anchor for hundreds of families worldwide. Established formally to safeguard the
              values, ancestral properties, and historical records born in Thrissur, Kerala, we
              collaborate across borders to fund community development, document new lineages, and
              celebrate our shared kinship.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 4. SCROLL-PINNED HORIZONTAL TIMELINE ─────────────────────────────── */}
      {/*
        KEY: overflow:hidden on ANY ancestor breaks position:sticky.
        The root wrapper must have NO overflow set. The sticky child and track
        wrapper use overflow:clip instead — it clips visually but does NOT
        create a new scroll container, so the page scroll drives the sticky pin.
      */}
      <div ref={pinSectionRef} className="relative mt-40" style={{ height: "280vh" }}>
        {/* CRITICAL: overflow:clip clips visually WITHOUT creating a scroll container, so sticky works correctly.
            overflow:hidden would break sticky by making this div the scroll container instead of the page. */}
        <div className="sticky top-0 h-screen flex flex-col justify-center bg-[#1b3622] text-[#fbf9f4]" style={{ overflow: "clip" }}>

          {/* Background dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(#d4af37 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />

          {/* Section label */}
          <div className="absolute top-10 left-6 md:left-12 lg:left-20 z-10 space-y-1">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: NORELL_EASE }}
              className="text-[10px] tracking-[0.3em] uppercase font-mono text-[#d4af37] block"
            >
              Historical Coordinates
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: NORELL_EASE }}
              className="text-2xl md:text-3xl font-serif font-light"
            >
              Centennial Century Line
            </motion.h2>
          </div>

          {/* overflow:clip clips visually but does NOT create a scroll container, so sticky still works */}
          <div className="w-full mt-12" style={{ overflow: "clip" }}>
            <motion.div
              style={{ x: xTrackTranslation, willChange: "transform" }}
              className="flex gap-8 px-6 md:px-12 lg:px-20 items-stretch"
            >
              {CENTENNIAL_TIMELINE.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.05, ease: NORELL_EASE }}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="flex-shrink-0 w-[310px] sm:w-[400px] bg-[#fbf9f4] text-[#1b3622] p-8 space-y-6 shadow-2xl relative cursor-default"
                  style={{ willChange: "transform" }}
                >
                  {/* Gold accent top bar */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#d4af37] origin-left" />

                  <div className="flex justify-between items-baseline border-b border-[#1b3622]/10 pb-4">
                    <span className="font-serif text-5xl md:text-6xl text-[#1b3622] font-light">
                      {item.era}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400 font-semibold bg-gray-100 px-2 py-0.5">
                      {item.location}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#1b3622]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-light leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[9px] font-mono text-gray-400">
                    <span>Authorized Authority</span>
                    <span className="text-[#d4af37] font-semibold">{item.authority}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Progress tracker HUD */}
          <div className="absolute bottom-12 left-6 md:left-12 lg:left-20 right-6 md:right-12 lg:right-20 space-y-2">
            <div className="w-full h-px bg-[#fbf9f4]/15 relative overflow-hidden">
              {/* FIX: use scaleX (0–1) + spring-smoothed value instead of width percentage string */}
              <motion.div
                style={{ scaleX: timelineProgressSpring }}
                className="absolute inset-0 bg-[#d4af37] origin-left"
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono tracking-widest text-[#fbf9f4]/35 uppercase">
              <span>Genesis 1924</span>
              <span>Scroll to traverse the century</span>
              <span>Centenary 2024</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 5. FOUR PILLARS ──────────────────────────────────────────────────── */}
      <section
        ref={pillarsRef}
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-40 space-y-16"
      >
        {/* FIX: pillarsHeadingOpacity / pillarsHeadingY now actually used */}
        <motion.div
          style={{ opacity: pillarsHeadingOpacity, y: pillarsHeadingY }}
          className="space-y-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#d4af37] block">
            Structural Blueprints
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light">
            Institutional Framework
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {HERITAGE_PILLARS.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            const isHovered = hoveredPillar === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, delay: idx * 0.12, ease: NORELL_EASE }}
                onHoverStart={() => setHoveredPillar(idx)}
                onHoverEnd={() => setHoveredPillar(null)}
                className="space-y-4 group relative pt-6 cursor-default"
              >
                {/* Animated top border */}
                <motion.div
                  className="absolute top-0 left-0 h-px bg-[#d4af37]"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: idx * 0.12 + 0.3, ease: NORELL_EASE }}
                />

                <div className="flex justify-between items-center">
                  <motion.div
                    animate={{ rotate: isHovered ? 12 : 0, scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <IconComponent className="h-5 w-5 text-[#d4af37] stroke-[1.25]" />
                  </motion.div>
                  <span className="font-serif text-4xl text-[#1b3622] font-bold transition-opacity duration-500"
                    style={{ opacity: isHovered ? 0.25 : 0.08 }}
                  >
                    {pillar.num}
                  </span>
                </div>

                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1b3622]">
                  {pillar.title}
                </h3>

                <motion.p
                  animate={{ color: isHovered ? "#4b5563" : "#9ca3af" }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-light leading-relaxed"
                >
                  {pillar.desc}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 6. FINALE: ORIGINS + EVENTS ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-40 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

        {/* Left: origin story */}
        <motion.div
          className="lg:col-span-6 space-y-6 lg:pr-12"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: NORELL_EASE }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#d4af37] block">
            The Origin Story
          </span>
          <h2 className="text-4xl text-[#1b3622] font-light font-serif leading-tight">
            Rooted in Central Kerala
          </h2>
          <p className="text-gray-600 leading-relaxed font-light text-sm">
            The legacy of the Pulazhiyil family originates deep within the lush cultural landscapes
            of Thrissur. For over a century, our ancestors built foundational structures of community
            support, spiritual roots, and progressive societal values that continue to guide us today.
          </p>
          <div className="pt-4">
            <Link
              href="/history"
              className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] font-bold text-[#1b3622] border-b border-[#1b3622]/20 pb-2 hover:border-[#1b3622] transition-colors duration-300"
            >
              <span>Read Full Chronicles</span>
              <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </motion.div>

        {/* Right: events board */}
        <motion.div
          className="lg:col-span-6 w-full bg-white border border-[#1b3622]/10 p-8 space-y-8 shadow-sm"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15, ease: NORELL_EASE }}
        >
          <div className="flex justify-between items-center border-b border-[#1b3622]/10 pb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold text-[#d4af37]">
              Upcoming Assemblies
            </span>
            <span className="bg-[#1b3622] text-[#fbf9f4] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-semibold">
              Live System Feed
            </span>
          </div>

          <AnimatePresence>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: NORELL_EASE }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                      <Calendar className="h-3 w-3 text-[#d4af37]" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl text-[#1b3622] font-serif font-light">{event.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-gray-400">
                    <MapPin className="h-3 w-3 text-[#1b3622]" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-400 italic font-light"
              >
                No formal upcoming gatherings scheduled at this time.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

      </section>
    </div>
  );
}