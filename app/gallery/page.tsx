import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";
import { resolveGalleryImageUrl, withCloudinaryTransform } from "@/utils/storage";
import GalleryClient, { type GalleryItemView } from "./_GalleryClient";

export const metadata = {
  title: "Gallery — Pulazhiyil Kudumbayogam",
  description: "Historical photographic archive of the Pullazhiyil family.",
};

// Retry helper for transient PGRST303 "JWT issued at future" clock-skew errors.
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

type GalleryRow = Pick<
  Database["public"]["Tables"]["gallery_records"]["Row"],
  | "id"
  | "title"
  | "description"
  | "album"
  | "branch"
  | "year_label"
  | "image_path"
  | "cloudinary_public_id"
  | "cloudinary_secure_url"
  | "sort_order"
>;

export default async function GalleryPage() {
  const supabase = await createClient();
  const response = await withSupabaseRetry(async () => {
    const r = await supabase
      .from("gallery_records")
      .select("id,title,description,album,branch,year_label,image_path,cloudinary_public_id,cloudinary_secure_url,sort_order")
      .eq("is_published", true)
      .order("branch")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true })
      .returns<GalleryRow[]>();
    return { data: r.data, error: r.error };
  });

  if (response.error) {
    console.error(
      "[Gallery] Error loading gallery records:",
      response.error.message || response.error,
      "code:",
      response.error.code
    );
  }

  const items: GalleryItemView[] = (response.data ?? []).map((row) => {
    const rawUrl = row.cloudinary_secure_url || resolveGalleryImageUrl(row.image_path);
    return {
      id: row.id,
      album: row.album,
      // Serve a right-sized, auto-formatted rendition in the grid; the untouched
      // original (or a larger rendition) is only fetched when the lightbox opens.
      imageUrl: withCloudinaryTransform(rawUrl, 900),
      fullImageUrl: withCloudinaryTransform(rawUrl, 1600),
      title: row.title,
      description: row.description ?? undefined,
      year: row.year_label ?? undefined,
      branch: row.branch ?? undefined,
      sort_order: row.sort_order ?? 0,
    };
  });

  return <GalleryClient items={items} />;
}
