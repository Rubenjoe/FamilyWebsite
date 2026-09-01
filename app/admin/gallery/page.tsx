import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import GalleryManager from "@/components/admin/GalleryManager";
import type { Database } from "@/types/supabase";

type GalleryRecord = Database["public"]["Tables"]["gallery_records"]["Row"];

export default async function GalleryPage() {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) redirect("/dashboard?error=unauthorized");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_records")
    .select("*")
    .order("branch")
    .order("sort_order")
    .returns<GalleryRecord[]>();

  if (error) {
    console.error(
      "[Admin Gallery] Error loading gallery records:",
      error.message || error,
      "code:",
      error.code,
      "details:",
      error.details
    );
  }

  return <GalleryManager initialRecords={data || []} />;
}
