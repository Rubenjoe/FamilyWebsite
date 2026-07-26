"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Calendar, ArrowRight, MapPin, ShieldCheck, Landmark, Globe, Award } from "lucide-react";
import { MOCK_MEMBERS, MOCK_EVENTS, MOCK_TIMELINE } from "../data/mockData";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Pillar {
  num: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NORELL_EASE = [0.16, 1, 0.3, 1] as const;

const HERITAGE_PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Knanaya Heritage",
    desc: "Preserving the Jewish-Christian traditions, endogamy, and cultural identity of the Knanaya community since A.D. 345.",
    icon: ShieldCheck,
  },
  {
    num: "02",
    title: "Faith & Family Values",
    desc: "Upholding the faith, love, and unity that our forefathers — from Sri. Kuriyala to the present generation — have entrusted to us.",
    icon: Landmark,
  },
  {
    num: "03",
    title: "Heritage Preservation",
    desc: "Documenting and safeguarding the oral traditions, family records, and ancestral history of the Pullazhiyil lineage for future generations.",
    icon: Globe,
  },
  {
    num: "04",
    title: "Global Family Unity",
    desc: "Connecting members across Kerala, India, the United States, Australia, and Europe through annual gatherings and cultural celebrations.",
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

  // Timeline section transforms removed

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
    <div className="bg-[#fbf9f4] text-[#1b3622] min-h-screen pb-32 selection:bg-[#1b3622] selection:text-[#fbf9f4] bg-parchment relative overflow-x-hidden">
      {/* Elegant Ambient Background Glows */}
      <div className="absolute top-[15%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#d4af37]/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[45%] right-[-10%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] rounded-full bg-[#1b3622]/5 blur-[90px] md:blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#d4af37]/4 blur-[80px] md:blur-[140px] pointer-events-none z-0" />

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
              Rooted in Heritage &bull; United in Faith &bull; Forever Bound by Family
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
              <p className="text-sm md:text-lg lg:text-xl tracking-[0.15em] uppercase text-[#fbf9f4]/70 font-mono">
                Pullazhiyil &bull; Thykurinjiyil &bull; Thanuvelil &bull; Poovathumparambil
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
                <span>Explore Our Family Tree</span>
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
            { value: "A.D. 345", label: "Knanaya Arrival" },
            { value: "4", label: "Principal Branches" },
            { value: "1940s", label: "Kudumbayogam Founded" },
            { value: "1998", label: "Revival Year" },
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
              Our Heritage
            </motion.span>
            <motion.h2
              style={{ y: infoTextY, opacity: infoTextOpacity }}
              className="text-3xl md:text-4xl font-serif font-light text-[#1b3622] leading-tight"
            >
              One Family. Four Branches. Centuries of Faith.
            </motion.h2>
          </div>

          <div className="md:col-span-7">
            <motion.p
              style={{ y: infoTextY, opacity: infoTextOpacity }}
              className="text-gray-600 font-light text-sm md:text-base leading-relaxed max-w-2xl"
            >
              The Pullazhiyil Kudumbayogam is more than an assembly; it is a live institutional
              anchor for hundreds of families worldwide. We trace our roots back to the historic Knanaya
              migration of A.D. 345 to Kodungalloor, later establishing our ancestral home at Iruvallipra, 
              Thiruvalla. We collaborate across borders to safeguard the values, properties, and 
              traditions of our four principal branches—Pullazhiyil, Thykurinjiyil, Thanuvelil, and Poovathumparambil.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 4. FOUR PILLARS ──────────────────────────────────────────────────── */}
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
            Our Foundation
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light">
            The Pillars of Our Family
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

      {/* ── Heritage Quote Banner ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: NORELL_EASE }}
          className="relative bg-[#1b3622] text-[#fbf9f4] p-10 md:p-16 overflow-hidden"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(#d4af37 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#d4af37] block">
              From Our Ancestors
            </span>
            <p className="text-xl md:text-2xl lg:text-3xl font-serif font-light italic leading-relaxed">
              &ldquo;The greatness of a family is measured not merely by its wealth or the number of its members, but by the faith, love, unity, and sense of heritage that bind generations together.&rdquo;
            </p>
            <div className="w-16 h-0.5 bg-[#d4af37]/50 mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em] font-mono text-[#fbf9f4]/50">
              Pullazhiyil Kudumbayogam Heritage
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Family Achievements ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-40 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: NORELL_EASE }}
          className="space-y-2 text-center md:text-left"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#d4af37] block">
            Celebrating Excellence
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light text-[#1b3622]">
            Family Achievements
          </h2>
          <div className="w-16 h-0.5 bg-[#d4af37] mt-4 mx-auto md:mx-0" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {[1, 2, 3].map((num) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: num * 0.12, ease: NORELL_EASE }}
              className="bg-white border border-[#1b3622]/10 p-6 flex flex-col justify-between space-y-5 shadow-sm group hover:shadow-md transition-all duration-500 rounded-sm"
            >
              {/* Photo Placeholder Frame (Generous Space) */}
              <div className="aspect-[3/4] w-full bg-[#fbf9f4] border border-dashed border-[#1b3622]/20 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group-hover:border-[#d4af37]/45 transition-colors duration-500">
                <Award className="h-10 w-10 text-[#d4af37] stroke-[1] mb-3 opacity-60 group-hover:scale-110 transition-transform duration-500" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#1b3622]/50 font-bold block mb-1">
                  Photo Placeholder
                </span>
                <span className="text-[9px] text-[#1b3622]/40 font-light block">
                  Generous space for portrait or award picture
                </span>
                
                {/* Decorative border corners */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#1b3622]/20" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#1b3622]/20" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#1b3622]/20" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#1b3622]/20" />
              </div>

              {/* Information Block */}
              <div className="space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#1b3622]/5 text-[#1b3622] text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border border-[#1b3622]/10">
                      Family Branch
                    </span>
                    <span className="text-gray-500 font-mono text-[10px]">
                      Year
                    </span>
                  </div>
                  <h3 className="text-lg text-[#1b3622] font-serif font-light leading-snug">
                    Family Member Name
                  </h3>
                  <p className="text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold font-mono">
                    Achievement Title / Recognition
                  </p>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    A short description detailing the award, recognition, or notable contribution achieved by this family member.
                  </p>
                </div>

                <div className="text-[9px] font-mono text-gray-500 pt-3 border-t border-gray-100">
                  Pulazhiyil Excellence Registry
                </div>
              </div>
            </motion.div>
          ))}
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
            Our Journey Since A.D. 345
          </span>
          <h2 className="text-4xl text-[#1b3622] font-light font-serif leading-tight">
            From Kodungalloor to the World
          </h2>
          <p className="text-gray-600 leading-relaxed font-light text-sm">
            The Pullazhiyil family is one of the seventy-two Knanaya families who arrived 
            at the historic port of Kodungalloor under the leadership of Knai Thoma. Our ancestors 
            later settled along the Manimala River at Iruvallipra, near Thiruvalla, where our 
            family name was born. From one household founded by Sri. Kuriyala emerged four 
            branches — Pullazhiyil, Thykurinjiyil, Thanuvelil, and Poovathumparambil — that 
            today span continents yet remain forever united.
          </p>
          <div className="pt-4">
            <Link
              href="/history"
              className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] font-bold text-[#1b3622] border-b border-[#1b3622]/20 pb-2 hover:border-[#1b3622] transition-colors duration-300"
            >
              <span>Read Our Full History</span>
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