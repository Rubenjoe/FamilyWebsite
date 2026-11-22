"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

const SIZE = 44;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Floating return control for long editorial pages. The hairline ring doubles
 * as a reading-progress indicator, so it earns its place instead of adding a
 * second scroll widget. Appears only after the visitor has committed to
 * scrolling, and honours reduced-motion preferences.
 */
export default function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      setIsVisible(window.scrollY > 600);
    };

    const onScroll = () => {
      // Background tabs pause requestAnimationFrame, so measure immediately
      // there instead of leaving the control in a stale state.
      if (document.visibilityState === "hidden") {
        measure();
        return;
      }
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.92 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="press group fixed bottom-5 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-[#1b3622]/12 bg-[#fbf9f4]/95 text-[#1b3622] shadow-[0_10px_30px_rgba(27,54,34,0.18)] backdrop-blur-sm transition-all duration-300 hover:bg-[#1b3622] hover:text-[#fbf9f4] hover:shadow-[0_14px_40px_rgba(27,54,34,0.22)] sm:bottom-7 sm:right-6"
        >
          <svg
            className="pointer-events-none absolute inset-0 -rotate-90"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            aria-hidden
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#d4af37"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              style={{ transition: "stroke-dashoffset 140ms linear" }}
            />
          </svg>
          <ArrowUp className="relative h-4 w-4 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
