/**
 * Re-mounts on every navigation, which gives each route a soft entrance
 * instead of a hard content swap. Kept to opacity only so `fixed` overlays
 * inside pages still position against the viewport.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
