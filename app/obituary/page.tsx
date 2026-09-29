import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";
import ObituaryClient from "./ObituaryClient";

type ObituaryRow = Pick<
  Database["public"]["Tables"]["heritage_records"]["Row"],
  "id" | "name" | "branch" | "image_url" | "birth_year" | "death_year" |
  "description" | "tribute" | "is_placeholder"
>;

export default async function ObituaryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("heritage_records")
    .select("id,name,branch,image_url,birth_year,death_year,description,tribute,is_placeholder")
    .eq("kind", "obituary")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .returns<ObituaryRow[]>();

  if (error) {
    console.error("[Obituary] Error loading records:", error.message, "code:", error.code);
  }

  return (
    <ObituaryClient
      obituaries={(data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        branch: row.branch,
        photoUrl: row.image_url ?? undefined,
        birthYear: row.birth_year ?? undefined,
        deathYear: row.death_year ?? undefined,
        bio: row.description ?? "",
        tribute: row.tribute ?? "",
        isPlaceholder: row.is_placeholder,
      }))}
      loadError={error ? "Unable to load remembrance records." : null}
    />
  );
}
