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

// ─── Server Component ─────────────────────────────────────────────────────────

// Number of cards shown per carousel section on the homepage.
const HOMEPAGE_SECTION_LIMIT = 4;

export default async function HomePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Published, non-placeholder heritage records of one kind, newest-pinned
  // first via sort_order, capped at the carousel size.
  const sectionQuery = (kind: "achiever" | "evangelist") =>
    supabase
      .from("heritage_records")
      .select("id,name,branch,title,description,image_url,year_label")
      .eq("kind", kind)
      .eq("is_published", true)
      .eq("is_placeholder", false)
      .order("sort_order", { ascending: true })
      .limit(HOMEPAGE_SECTION_LIMIT)
      .returns<HeritageRow[]>();

  // Head-count of ALL published records per kind (not capped) so the homepage
  // can show "View all — N honourees" next to each curated carousel.
  const countQuery = (kind: "achiever" | "evangelist") =>
    supabase
      .from("heritage_records")
      .select("id", { count: "exact", head: true })
      .eq("kind", kind)
      .eq("is_published", true)
      .eq("is_placeholder", false);

  const [achieverRows, evangelistRows, achieverCount, evangelistCount, eventsResult] =
    await Promise.all([
      sectionQuery("achiever"),
      sectionQuery("evangelist"),
      countQuery("achiever"),
      countQuery("evangelist"),
      supabase
        .from("events")
        .select("id,title,description,event_date,location")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3)
        .returns<EventRow[]>(),
    ]);

  for (const result of [achieverRows, evangelistRows, eventsResult]) {
    if (result.error) {
      console.error(
        "[Homepage] Error loading data:",
        result.error.message || result.error,
        "code:",
        result.error.code
      );
    }
  }

  return (
    <HomeClient
      achievers={achieverRows.data ?? []}
      evangelists={evangelistRows.data ?? []}
      achieverTotal={achieverCount.count ?? achieverRows.data?.length ?? 0}
      evangelistTotal={evangelistCount.count ?? evangelistRows.data?.length ?? 0}
      upcomingEvents={eventsResult.data ?? []}
    />
  );
}
