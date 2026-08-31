import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";
import HomeClient from "./_HomeClient";

export const metadata = {
  title: "Pullazhiyil Kudumbayogam — Heritage Archive",
  description:
    "The official digital home of the Pullazhiyil Kudumbayogam. Explore four branches of Knanaya heritage: Pullazhiyil, Thykurinjiyil, Thanuvelil, and Poovathumparambil.",
};

// ─── Derived row types used as props ─────────────────────────────────────────

type HeritageRow = Pick<
  Database["public"]["Tables"]["heritage_records"]["Row"],
  "id" | "name" | "branch" | "title" | "description" | "image_url" | "year_label"
>;

type EventRow = Pick<
  Database["public"]["Tables"]["events"]["Row"],
  "id" | "title" | "description" | "event_date" | "location"
>;

// Internal shape that includes `kind` for splitting into achievers / evangelists
type HeritageRowWithKind = HeritageRow & {
  kind: Database["public"]["Tables"]["heritage_records"]["Row"]["kind"];
};

// ─── Server Component ─────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Run both queries in parallel for performance.
  // A single heritage query fetches both achievers and evangelists (up to 8 total)
  // so the page makes only two round-trips regardless of content volume.
  const [heritageResult, eventsResult] = await Promise.all([
    supabase
      .from("heritage_records")
      .select("id,kind,name,branch,title,description,image_url,year_label")
      .in("kind", ["achiever", "evangelist"])
      .eq("is_published", true)
      .eq("is_placeholder", false)
      .order("sort_order", { ascending: true })
      .limit(8)
      .returns<HeritageRowWithKind[]>(),
    supabase
      .from("events")
      .select("id,title,description,event_date,location")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(3)
      .returns<EventRow[]>(),
  ]);

  if (heritageResult.error) {
    console.error(
      "[Homepage] Error loading heritage records:",
      heritageResult.error
    );
  }
  if (eventsResult.error) {
    console.error("[Homepage] Error loading events:", eventsResult.error);
  }

  const allHeritage = heritageResult.data ?? [];

  // Split the combined result into the two homepage sections.
  // Apply a per-kind cap of 4 so the carousel has enough items to overflow
  // on desktop (3 cards fill the grid exactly; a 4th creates the scroll).
  const achievers: HeritageRow[] = allHeritage
    .filter((r) => r.kind === "achiever")
    .slice(0, 4);
  const evangelists: HeritageRow[] = allHeritage
    .filter((r) => r.kind === "evangelist")
    .slice(0, 4);

  return (
    <HomeClient
      achievers={achievers}
      evangelists={evangelists}
      upcomingEvents={eventsResult.data ?? []}
    />
  );
}