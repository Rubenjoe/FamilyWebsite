/**
 * Serif monogram rendered when a heritage record has no portrait yet.
 * Keeps the empty photo frame looking intentional instead of unfinished.
 */
export default function InitialsMonogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1b3622]/[0.03] to-[#d4af37]/[0.06] p-6">
      <span className="font-serif text-4xl md:text-5xl font-light tracking-[0.08em] text-[#1b3622]/45 select-none">
        {initials || "—"}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-[#1b3622]/35 font-bold">
        Portrait Awaited
      </span>
    </div>
  );
}
