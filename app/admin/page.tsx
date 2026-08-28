import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import type { Member } from "@/app/tree/FamilyTree";
import type { Database } from "@/types/supabase";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard?error=unauthorized");
  }

  const supabase = await createClient();

  const [membersResult, eventsResult] = await Promise.all([
    supabase
      .from("members")
      .select("id,name,photo_url,birth_date,death_date,bio,father_id,mother_id,spouse_id")
      .returns<Member[]>()
      .limit(1000),
    supabase
      .from("events")
      .select("id,title,event_date")
      .returns<EventRow[]>()
      .limit(1000),
  ]);

  return (
    <AdminDashboardClient
      memberCount={membersResult.data?.length || 0}
      eventCount={eventsResult.data?.length || 0}
      role={session.role}
      canEditMembers={session.canEditMembers}
      canEditEvents={session.canEditEvents}
      canViewDues={session.canViewDues}
    />
  );
}
