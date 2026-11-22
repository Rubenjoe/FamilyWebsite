"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "pulazhiyil:intro-shown";

/**
 * Short brand curtain on the first paint of a session. It shows the family
 * mark, the Malayalam name and a drawing gold rule, then fades away. Shown
 * once per browser session so repeat navigation stays instant.
 */
export default function AppPreloader() {
  const [isMounted, setIsMounted] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Storage can be blocked (private mode / strict settings) — just show it.
    }

    if (alreadyShown) {
      setIsMounted(false);
      return;
    }

    // Keep the curtain short: it covers real content, so every extra
    // millisecond reads as a slower site.
    const startLeaving = setTimeout(() => setIsLeaving(true), 520);
    const unmount = setTimeout(() => {
      setIsMounted(false);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Ignore — the curtain simply appears again next load.
      }
    }, 900);

    return () => {
      clearTimeout(startLeaving);
      clearTimeout(unmount);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`app-preloader ${isLeaving ? "is-leaving" : ""}`}
      role="status"
      aria-label="Loading the Pullazhiyil heritage archive"
    >
      {/* Soft warm ambient center glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#d4af37]/10 blur-3xl sm:h-96 sm:w-96"
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center">
        <div className="relative">
          <img
            src="/images/logo.png"
            alt=""
            aria-hidden
            className="h-16 w-auto object-contain transition-transform duration-700 ease-out sm:h-20"
          />
        </div>
        <span className="Malayalam-font text-base font-semibold tracking-wide text-[#1b3622] sm:text-xl">
          പുല്ലാഴിയിൽ കുടുംബയോഗം
        </span>
        <div className="relative flex items-center justify-center">
          <span className="app-preloader__line h-[1.5px] w-44 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent sm:w-60" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a6a0f] font-medium">
          Heritage Archive &amp; Genealogy
        </span>
      </div>
    </div>
  );
}
