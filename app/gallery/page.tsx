import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";
import { resolveGalleryImageUrl, withCloudinaryTransform } from "@/utils/storage";
import GalleryClient, { type GalleryItemView } from "./_GalleryClient";

export const metadata = {
  title: "Gallery — Pulazhiyil Kudumbayogam",
  description: "Historical photographic archive of the Pullazhiyil family.",
};

type GalleryRow = Pick<
  Database["public"]["Tables"]["gallery_records"]["Row"],
  "id" | "title" | "description" | "album" | "branch" | "year_label" | "image_path" | "cloudinary_public_id" | "cloudinary_secure_url"
>;

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_records")
    .select("id,title,description,album,branch,year_label,image_path,cloudinary_public_id,cloudinary_secure_url")
    .eq("is_published", true)
    .order("branch")
    .order("sort_order", { ascending: true })
    .returns<GalleryRow[]>();

  if (error) {
    console.error(
      "[Gallery] Error loading gallery records:",
      error.message || error,
      "code:",
      (error as { code?: string }).code,
      "details:",
      (error as { details?: string }).details
    );
  }

  const items: GalleryItemView[] = (data ?? []).map((row) => {
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
    };
  });

  return <GalleryClient items={items} />;
}
