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
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <img
          src="/images/logo.png"
          alt=""
          aria-hidden
          className="h-16 w-auto object-contain sm:h-20"
        />
        <span className="Malayalam-font text-base text-[#1b3622] sm:text-lg">
          പുല്ലാഴിയിൽ കുടുംബയോഗം
        </span>
        <span className="app-preloader__line h-px w-40 bg-[#d4af37]/70 sm:w-56" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1b3622]/45">
          Heritage Archive
        </span>
      </div>
    </div>
  );
}
