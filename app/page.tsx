import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";
import HomeClient from "./_HomeClient";

export const metadata = {
  title: "Pullazhiyil Kudumbayogam — Heritage Archive",
  description:
    "The official digital home of the Pullazhiyil Kudumbayogam. Explore four branches of Knanaya heritage: Pullazhiyil, Thykurinjiyil, Thanuvelil, and Poovathumparambil.",
};

// ─── Retry helper for PGRST303 clock-skew errors ──────────────────────────────
// Supabase may reject a freshly-issued JWT if its server clock is slightly behind
// the local machine. Wait a short moment and retry once; by then the token's
// "issued at" time is in the past relative to Supabase.
async function withSupabaseRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string }).code;
    if (code === "PGRST303" || message.includes("JWT issued at future")) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return await fn();
    }
    throw err;
  }
}

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

  const runSection = async (kind: "achiever" | "evangelist") => {
    return withSupabaseRetry(async () => {
      const r = await sectionQuery(kind);
      return { data: r.data, error: r.error };
    });
  };

  const runCount = async (kind: "achiever" | "evangelist") => {
    return withSupabaseRetry(async () => {
      const r = await countQuery(kind);
      return { data: r.data, error: r.error, count: r.count };
    });
  };

  const runEvents = async () => {
    return withSupabaseRetry(async () => {
      const r = await supabase
        .from("events")
        .select("id,title,description,event_date,location")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3)
        .returns<EventRow[]>();
      return { data: r.data, error: r.error };
    });
  };

  const [achieverRows, evangelistRows, achieverCount, evangelistCount, eventsResult] =
    await Promise.all([
      runSection("achiever"),
      runSection("evangelist"),
      runCount("achiever"),
      runCount("evangelist"),
      runEvents(),
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
