import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AuditLogView from "@/components/admin/AuditLogView";
import type { Database } from "@/types/supabase";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

export default async function AdminAuditLogPage() {
  const session = await getAdminSession();
  if (!session || !session.canViewAudit) {
    redirect("/dashboard?error=unauthorized");
  }

  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from("audit_log")
    .select("id,user_id,action,target_id,changes,created_at")
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<AuditLogRow[]>();

  if (error) {
    console.error("Error loading audit log:", error);
  }

  return <AuditLogView initialLogs={logs || []} />;
}
