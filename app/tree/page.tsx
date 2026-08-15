import { Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import FamilyTree from "./FamilyTree";

interface PageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function GenealogyTreePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";

  // Create server-side supabase client
  const supabase = await createClient();

  // Fetch all members (small dataset, ~440 people max, no pagination needed)
  const { data: members, error } = await supabase
    .from("members")
    .select("*");

  if (error || !members || members.length === 0) {
    console.error("Error loading members:", error);
  }

  // Find the root person (whoever has no father_id and no mother_id)
  // Look for Thomas Mathew specifically, fallback to first person with no parents
  const rootPerson = members?.find(
    (m) => !m.father_id && !m.mother_id && m.name?.includes("Thomas Mathew")
  ) || members?.find((m) => !m.father_id && !m.mother_id);

  return (
    <div className="min-h-screen bg-[#fbf9f4] pb-16 sm:pb-24">

      {/* Context Header */}
      <div className="bg-white border-b border-[#1b3622]/5 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-5 sm:gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold block">Interactive Lineage Map</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1b3622] font-normal">Ancestral Genealogy Tree</h1>
            <p className="text-gray-500 font-light text-sm pt-2 max-w-lg">
              Trace the descendants from the original founders across 4 mapped generations.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <form action="" method="GET" className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Locate specific member..."
                className="w-full bg-[#fbf9f4] border border-gray-200 pl-9 pr-4 py-2.5 sm:py-2 text-xs tracking-wide focus:outline-none focus:border-[#1b3622] focus-visible:ring-2 focus-visible:ring-[#d4af37] text-[#2d312e]"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Tree Workspace Dynamic Renderer */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-8 sm:mt-12">
        <div className="bg-white border border-gray-100 shadow-sm p-3 sm:p-8 min-h-[600px] flex flex-col items-center justify-start relative overflow-x-auto">

          {/* Decorative background grid */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1b3622_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

          {error ? (
            <div className="relative z-10 text-center py-12 text-red-700 font-serif px-4">
              Failed to connect to the digital archive. Please try again later.
            </div>
          ) : !members || members.length === 0 ? (
            <div className="relative z-10 text-center py-12 text-gray-500 font-serif px-4">
              No family records found.
            </div>
          ) : !rootPerson ? (
            <div className="relative z-10 text-center py-12 text-gray-500 font-serif px-4">
              Could not determine the patriarch root node in the records.
            </div>
          ) : (
            <div className="relative z-10 w-full">
              <FamilyTree members={members} rootId={rootPerson.id} />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}