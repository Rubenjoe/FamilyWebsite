import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import CommitteeManager from "@/components/admin/CommitteeManager";
import type { Database } from "@/types/supabase";

type CommitteeRecord = Database["public"]["Tables"]["committee_members"]["Row"];

export default async function CommitteePage() {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) redirect("/dashboard?error=unauthorized");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("committee_members")
    .select("*")
    .order("committee_year", { ascending: false })
    .order("sort_order")
    .returns<CommitteeRecord[]>();

  if (error) {
    console.error(
      "[Admin Committee] Error loading committee records:",
      error.message || error,
      "code:",
      error.code,
      "details:",
      error.details
    );
  }

  return <CommitteeManager initialRecords={data || []} />;
}
