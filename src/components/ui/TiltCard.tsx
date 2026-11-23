"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt.
 *
 * A single rAF-throttled transform per hovered surface — no Framer Motion, no
 * layout reads on the scroll path. Disabled for touch/pen and for visitors who
 * prefer reduced motion, where it degrades to the untouched child markup.
 */
export default function TiltCard({
  children,
  className = "",
  max = 7,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees at the far corners. */
  max?: number;
  glare?: boolean;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    const sync = () => {
      enabledRef.current = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabledRef.current || event.pointerType !== "mouse") return;
      const scene = sceneRef.current;
      const surface = surfaceRef.current;
      if (!scene || !surface) return;

      const rect = scene.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const rotateY = (0.5 - px) * max * 2;
        const rotateX = (py - 0.5) * max * 2;
        surface.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2
        )}deg) translateZ(0)`;
        surface.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        surface.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
      });
    },
    [max]
  );

  const reset = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const scene = sceneRef.current;
    const surface = surfaceRef.current;
    if (!scene || !surface) return;
    scene.classList.remove("is-tilting");
    surface.style.transform = "";
  }, []);

  return (
    <div
      ref={sceneRef}
      className={`tilt-scene ${className}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={(event) => {
        if (!enabledRef.current || event.pointerType !== "mouse") return;
        sceneRef.current?.classList.add("is-tilting");
      }}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <div ref={surfaceRef} className="tilt-surface">
        {children}
        {glare && <span aria-hidden className="tilt-glare" />}
      </div>
    </div>
  );
}
