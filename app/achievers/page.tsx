import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";
import AchieversClient from "./_AchieversClient";

export const metadata = {
  title: "Heritage Registry — Achievers & Evangelists | Pullazhiyil Kudumbayogam",
  description:
    "The Pullazhiyil Heritage Registry: honoring family achievers and evangelists across the Pullazhiyil, Thykurinjiyil, Thanuvelil, and Poovathumparambil branches.",
};

type HeritageRow = Pick<
  Database["public"]["Tables"]["heritage_records"]["Row"],
  "id" | "name" | "branch" | "title" | "description" | "image_url" | "year_label"
>;

type Tab = "achievers" | "evangelists";

const SELECT_COLUMNS =
  "id,name,branch,title,description,image_url,year_label";

async function fetchKind(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kind: "achiever" | "evangelist"
) {
  const result = await supabase
    .from("heritage_records")
    .select(SELECT_COLUMNS)
    .eq("kind", kind)
    .eq("is_published", true)
    .eq("is_placeholder", false)
    .order("sort_order", { ascending: true })
    .returns<HeritageRow[]>();
  if (result.error) {
    console.error(
      `[Achievers] Error loading ${kind} records:`,
      result.error.message || result.error,
      "code:",
      result.error.code
    );
  }
  return result.data ?? [];
}

export default async function AchieversPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab: Tab = tabParam === "evangelists" ? "evangelists" : "achievers";

  const [achievers, evangelists] = await Promise.all([
    fetchKind(supabase, "achiever"),
    fetchKind(supabase, "evangelist"),
  ]);

  // schema.org structured data — server-rendered so the real registry records,
  // not a client-side placeholder, are what search engines index.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Pullazhiyil Heritage Registry",
    itemListElement: [...achievers, ...evangelists].map((record, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: record.name,
        ...(record.description ? { description: record.description } : {}),
        ...(record.title ? { jobTitle: record.title } : {}),
        ...(record.image_url ? { image: record.image_url } : {}),
        ...(record.branch
          ? {
              additionalName: `${record.branch} branch, Pullazhiyil Kudumbayogam`,
            }
          : {}),
      },
    })),
  };

  return (
    <div className="bg-[#fbf9f4] text-[#1b3622] min-h-screen selection:bg-[#1b3622] selection:text-[#fbf9f4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient glows */}
      <div className="fixed top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#d4af37]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1b3622]/4 blur-[140px] pointer-events-none z-0" />

      {/* ── Page Header ── */}
      <div className="relative bg-[#1b3622] text-[#fbf9f4] px-6 md:px-12 lg:px-20 pt-20 pb-16 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(#d4af37 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#d4af37]/90 hover:text-[#d4af37] text-xs uppercase tracking-[0.18em] font-mono font-bold transition-colors duration-200 mb-8 group"
          >
            <span aria-hidden className="inline-block rotate-180 group-hover:-translate-x-1 transition-transform duration-200">→</span>
            Back to Home
          </Link>

          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.22em] font-mono text-[#d4af37] block">
              Pullazhiyil Heritage Registry
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight">
              Achievers &amp; Evangelists
            </h1>
            <p className="text-[#fbf9f4]/85 font-normal text-base md:text-lg max-w-xl leading-relaxed">
              Honoring the accomplishments and faith-filled service of the
              Pullazhiyil Kudumbayogam across generations and branches.
            </p>
          </div>
        </div>
      </div>

      <AchieversClient
        achievers={achievers}
        evangelists={evangelists}
        initialTab={initialTab}
      />
    </div>
  );
}
