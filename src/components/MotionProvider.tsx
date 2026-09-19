"use client";

import { MotionConfig } from "framer-motion";

/**
 * Global Framer Motion configuration.
 * `reducedMotion="user"` automatically transforms transform/layout animations
 * into instant state changes (opacity is preserved) for visitors who have
 * "reduce motion" enabled at the OS level.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
