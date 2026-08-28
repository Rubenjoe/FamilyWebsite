import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import RoleManager from "@/components/admin/RoleManager";
import type { Database } from "@/types/supabase";

type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];

export default async function AdminRolesPage() {
  const session = await getAdminSession();
  if (!session || !session.canManageRoles) {
    redirect("/dashboard?error=unauthorized");
  }

  const supabase = await createClient();
  const { data: adminUsers, error } = await supabase
    .from("admin_users")
    .select("id,role,created_at")
    .order("created_at", { ascending: false })
    .returns<AdminUserRow[]>();

  if (error) {
    console.error("Error loading admin users:", error);
  }

  return <RoleManager initialAdminUsers={adminUsers || []} currentUserId={session.user.id} />;
}
