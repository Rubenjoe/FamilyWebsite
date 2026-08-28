import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import MemberManager from "@/components/admin/MemberManager";
import type { Member } from "@/app/tree/FamilyTree";

export default async function AdminMembersPage() {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) {
    redirect("/dashboard?error=unauthorized");
  }

  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("id,name,photo_url,birth_date,death_date,bio,father_id,mother_id,spouse_id")
    .order("name", { ascending: true })
    .returns<Member[]>();

  if (error) {
    console.error("Error loading members:", error);
  }

  return <MemberManager initialMembers={members || []} />;
}
