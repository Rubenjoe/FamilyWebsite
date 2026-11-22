"use client";

import { motion } from "framer-motion";

/**
 * Small switch used for publish flags. A native checkbox with an accent colour
 * reads as a form field; this reads as a setting, and the thumb springs between
 * states so the change is felt as well as seen.
 */
export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-300 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 focus-visible:ring-offset-2 ${
        checked
          ? "border-[#1b3622] bg-[#1b3622]"
          : "border-[#1b3622]/20 bg-[#1b3622]/5 hover:border-[#1b3622]/35"
      }`}
    >
      <motion.span
        aria-hidden
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 480, damping: 30, mass: 0.6 }}
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-sm ${
          checked ? "bg-[#d4af37]" : "bg-white"
        }`}
      />
    </button>
  );
}
