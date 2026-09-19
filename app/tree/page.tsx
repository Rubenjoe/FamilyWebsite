import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import FamilyTree from "./FamilyTree";
import SearchBox from "./SearchBox";
import type { Member } from "./FamilyTree";

interface PageProps {
  searchParams: Promise<{ query?: string }>;
}

/** Depth of the lineage (1 = founding generation). */
function countGenerations(members: Member[]): number {
  const byId = new Map(members.map((m) => [m.id, m]));
  const cache = new Map<string, number>();
  const depth = (m: Member): number => {
    const cached = cache.get(m.id);
    if (cached !== undefined) return cached;
    let d = 1;
    for (const pid of [m.father_id, m.mother_id]) {
      const parent = pid ? byId.get(pid) : undefined;
      if (parent) d = Math.max(d, depth(parent) + 1);
    }
    cache.set(m.id, d);
    return d;
  };
  return members.reduce((max, m) => Math.max(max, depth(m)), 0);
}

export default async function GenealogyTreePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";

  // Create server-side supabase client
  const supabase = await createClient();

  // Fetch all members (small dataset, ~440 people max, no pagination needed)
  const { data: members, error } = await supabase
    .from("members")
    // Only expose fields needed by the public lineage renderer.
    // Keep private/admin columns out of the browser payload.
    .select("id,name,photo_url,birth_date,death_date,bio,father_id,mother_id,spouse_id")
    .returns<Member[]>();

  if (error || !members || members.length === 0) {
    console.error("Error loading members:", error);
  }

  // Find the root person (whoever has no father_id and no mother_id)
  // Look for Thomas Mathew specifically, fallback to first person with no parents
  const rootPerson =
    members?.find(
      (m) => !m.father_id && !m.mother_id && m.name?.includes("Thomas Mathew")
    ) || members?.find((m) => !m.father_id && !m.mother_id);

  const generations = members && members.length > 0 ? countGenerations(members) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf9f4]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative border-b border-[#1b3622]/8 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-4 py-10 sm:px-8 sm:py-14 md:flex-row md:items-end">
          <div className="space-y-3">
            <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#b8912e]">
              <span className="h-px w-8 bg-[#d4af37]/60" />
              Interactive Lineage Map
            </span>
            <h1 className="font-serif text-3xl font-medium text-[#1b3622] sm:text-4xl md:text-[2.75rem] md:leading-tight">
              Ancestral Genealogy Tree
            </h1>
            <p className="max-w-lg text-[15px] leading-relaxed text-[#1b3622]/55">
              Trace the descendants from the original founders across{" "}
              {generations || 4} mapped generations. Drag the canvas to
              explore the lineage, use search to locate members, and the
              controls to frame the whole family at a glance.
            </p>
            {members && members.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="rounded-full border border-[#1b3622]/10 bg-[#1b3622]/[0.04] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#1b3622]/70">
                  {members.length} Members
                </span>
                <span className="rounded-full border border-[#1b3622]/10 bg-[#1b3622]/[0.04] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#1b3622]/70">
                  {generations} Generations
                </span>
              </div>
            )}
          </div>
          <div className="w-full md:w-auto">
            <Suspense
              fallback={
                <div className="h-11 w-full animate-pulse rounded-full bg-white/60 sm:w-72" />
              }
            >
              <SearchBox initialQuery={query} />
            </Suspense>
          </div>
        </div>
        {/* gold hairline flourish */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.65) 50%, transparent 100%)",
          }}
        />
      </header>

      {/* ── Tree workspace ─────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-2 pb-10 sm:px-6 sm:pb-14">
        <div className="mt-6 w-full sm:mt-8">
          {error ? (
            <div className="mx-auto max-w-md rounded-2xl border border-red-900/10 bg-white px-8 py-12 text-center shadow-sm">
              <p className="font-serif text-lg text-red-800">
                Failed to connect to the digital archive.
              </p>
              <p className="mt-2 text-sm text-[#1b3622]/50">
                Please refresh the page or try again later.
              </p>
            </div>
          ) : !members || members.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-[#1b3622]/10 bg-white px-8 py-12 text-center shadow-sm">
              <p className="font-serif text-lg text-[#1b3622]">No family records found.</p>
              <p className="mt-2 text-sm text-[#1b3622]/50">
                The archive appears to be empty at the moment.
              </p>
            </div>
          ) : !rootPerson ? (
            <div className="mx-auto max-w-md rounded-2xl border border-[#1b3622]/10 bg-white px-8 py-12 text-center shadow-sm">
              <p className="font-serif text-lg text-[#1b3622]">
                Could not determine the patriarch root node.
              </p>
              <p className="mt-2 text-sm text-[#1b3622]/50">
                Make sure the founding member has no parents assigned.
              </p>
            </div>
          ) : (
            <FamilyTree members={members} rootId={rootPerson.id} />
          )}
        </div>
      </main>

      {/* ── Footer (sticks to viewport bottom on short pages) ──── */}
      <footer className="mt-auto border-t border-[#1b3622]/6 bg-white/50 py-5 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1b3622]/35">
          Preserved with care · The Family Archive
        </p>
      </footer>
    </div>
  );
}
