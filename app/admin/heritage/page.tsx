import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import HeritageManager from "@/components/admin/HeritageManager";
import type { Database } from "@/types/supabase";

type Record = Database["public"]["Tables"]["heritage_records"]["Row"];
export default async function HeritagePage() {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) redirect("/dashboard?error=unauthorized");
  const supabase = await createClient();
  const { data } = await supabase.from("heritage_records").select("*").order("kind").order("sort_order").returns<Record[]>();
  return <HeritageManager initialRecords={data || []} />;
}
