import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";

type AdminRole = Database["public"]["Tables"]["admin_users"]["Row"]["role"];

export interface AdminSession {
  user: {
    id: string;
    email: string | undefined;
  };
  role: AdminRole;
  isAdmin: boolean;
  isSecretary: boolean;
  isTreasurer: boolean;
  canEditMembers: boolean;
  canEditEvents: boolean;
  canManageRoles: boolean;
  canViewAudit: boolean;
  canViewDues: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const user = userData.user;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!adminUser) return null;

  const role = adminUser.role;
  const isAdmin = role === "admin";
  const isSecretary = role === "secretary" || isAdmin;
  const isTreasurer = role === "treasurer" || isAdmin;

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    role,
    isAdmin,
    isSecretary,
    isTreasurer,
    canEditMembers: isSecretary,
    canEditEvents: isSecretary,
    canManageRoles: isAdmin,
    canViewAudit: isAdmin,
    canViewDues: isTreasurer,
  };
}

export function requireAdmin() {
  return getAdminSession().then((session) => {
    if (!session) {
      throw new Error("Unauthorized");
    }
    return session;
  });
}
