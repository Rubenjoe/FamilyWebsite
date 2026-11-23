"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a figure up when it first scrolls into view.
 *
 * Uses a single IntersectionObserver + rAF tick, then disconnects. Visitors who
 * prefer reduced motion see the final value immediately.
 */
export default function CountUp({
  value,
  duration = 1100,
  className = "",
  suffix = "",
  prefix = "",
  ariaLabel,
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          // easeOutCubic: quick start, gentle landing
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className} aria-label={ariaLabel}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
