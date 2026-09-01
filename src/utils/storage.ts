import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const GALLERY_BUCKET = "gallery-photos";
export const HERITAGE_BUCKET = "heritage-photos";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** Maximum upload size: 5 MB */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return "Only JPEG, PNG, and WEBP images are supported.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export function resolveStorageUrl(bucket: string, path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function resolveGalleryImageUrl(path: string | null | undefined): string {
  return resolveStorageUrl(GALLERY_BUCKET, path);
}

/** Extract the storage object path from a public URL or return the path as-is. */
export function extractStoragePath(
  value: string | null | undefined,
  bucket: string
): string | null {
  if (!value) return null;
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return value;
  }
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = value.indexOf(marker);
  if (index === -1) return null;
  return value.slice(index + marker.length);
}

export async function deleteStorageObject(
  supabase: SupabaseClient<Database>,
  bucket: string,
  pathOrUrl: string | null | undefined
): Promise<void> {
  const path = extractStoragePath(pathOrUrl, bucket);
  if (!path) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`[storage] Failed to delete ${bucket}/${path}:`, error.message);
  }
}

export function buildGalleryStoragePath(originalName: string): string {
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `gallery/${uniqueId}-${sanitizedName}`;
}
