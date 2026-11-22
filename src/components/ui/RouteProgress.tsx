"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Phase = "idle" | "loading" | "complete";

/**
 * Hairline gold progress bar that runs along the top edge while an internal
 * navigation is resolving. Purely visual — it never intercepts the click, it
 * only listens for same-origin link activations and pathname changes.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const isFirstRender = useRef(true);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route change finished → snap to 100%, then fade out.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (completeTimer.current) clearTimeout(completeTimer.current);
    setPhase("complete");
    completeTimer.current = setTimeout(() => setPhase("idle"), 480);
    return () => {
      if (completeTimer.current) clearTimeout(completeTimer.current);
    };
  }, [pathname]);

  // Start the bar as soon as an internal link is activated.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      setPhase("loading");
    };

    const handlePopState = () => setPhase("loading");

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Safety net: never leave the bar stuck if a navigation is cancelled.
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("idle"), 8000);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="route-progress" data-phase={phase} aria-hidden="true">
      <span className="route-progress__bar" />
    </div>
  );
}
