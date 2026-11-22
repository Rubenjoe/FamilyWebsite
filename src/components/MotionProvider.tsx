"use client";

import { MotionConfig } from "framer-motion";

/**
 * Global Framer Motion configuration.
 *
 * - `reducedMotion="user"` turns transform/layout animations into instant state
 *   changes (opacity is preserved) for visitors who ask for less motion.
 * - The default transition makes every component that does not specify its own
 *   timing inherit the same signature curve, so nothing falls back to Framer's
 *   generic spring or tween. Components that want a spring still opt in.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
