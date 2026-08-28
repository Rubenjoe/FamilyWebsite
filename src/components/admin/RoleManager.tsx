"use client";

import { useState, useCallback } from "react";
import { Trash2, UserPlus } from "lucide-react";
import type { Database } from "@/types/supabase";
import AdminPageHeader from "./AdminPageHeader";
import Toast, { useToast } from "./Toast";
import { createClient } from "@/utils/supabase/client";

type AdminRole = Database["public"]["Tables"]["admin_users"]["Row"]["role"];
type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];

interface RoleManagerProps {
  initialAdminUsers: AdminUserRow[];
  currentUserId: string;
}

const ROLES: AdminRole[] = ["admin", "secretary", "treasurer"];

export default function RoleManager({ initialAdminUsers, currentUserId }: RoleManagerProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>(initialAdminUsers);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("secretary");
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, closeToast } = useToast();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id,role,created_at")
      .order("created_at", { ascending: false })
      .returns<AdminUserRow[]>();
    if (error) {
      showToast(error.message || "Failed to refresh roles", "error");
    } else {
      setAdminUsers(data || []);
    }
  }, [supabase, showToast]);

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.rpc("get_user_id_by_email", {
        email: newEmail.trim().toLowerCase(),
      });
      if (error) throw error;
      if (!data) {
        throw new Error("No user found with that email. They must sign up first.");
      }
      const userId = data as string;

      const { error: insertError } = await supabase
        .from("admin_users")
        .insert({ id: userId, role: newRole });
      if (insertError) throw insertError;

      showToast("Admin role assigned successfully");
      setNewEmail("");
      setNewRole("secretary");
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to assign role", "error");
    } finally {
      setIsSaving(false);
    }
  }, [newEmail, newRole, supabase, showToast, refresh]);

  const handleUpdateRole = async (userId: string, role: AdminRole) => {
    if (userId === currentUserId) {
      showToast("You cannot change your own role.", "error");
      return;
    }
    const { error } = await supabase
      .from("admin_users")
      .update({ role })
      .eq("id", userId);
    if (error) {
      showToast(error.message || "Failed to update role", "error");
    } else {
      showToast("Role updated successfully");
      await refresh();
    }
  };

  const handleRemove = async (userId: string) => {
    if (userId === currentUserId) {
      showToast("You cannot remove yourself.", "error");
      return;
    }
    if (!confirm("Remove this admin user's access?")) return;
    const { error } = await supabase.from("admin_users").delete().eq("id", userId);
    if (error) {
      showToast(error.message || "Failed to remove role", "error");
    } else {
      showToast("Admin user removed");
      await refresh();
    }
  };

  return (
    <div className="space-y-8">
      <Toast messages={toasts} onClose={closeToast} />
      <AdminPageHeader
        title="Role-Based Access"
        subtitle="Assign admin roles to signed-up users. Only administrators can manage roles."
      />

      <form onSubmit={handleAdd} className="bg-white border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-[#d4af37] font-bold border-b border-gray-50 pb-2 flex items-center gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Assign Admin Access</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              User Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminRole)}
              className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 font-light">
          The user must already have a Supabase account. Their email must match their auth account exactly.
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#1b3622] text-[#fbf9f4] hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && (
            <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          Assign Role
        </button>
      </form>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fbf9f4] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User ID</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 font-light">
                    No admin users assigned yet.
                  </td>
                </tr>
              ) : (
                adminUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-b-0 hover:bg-[#fbf9f4]/50">
                    <td className="px-4 py-3 font-mono text-gray-500">{user.id}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as AdminRole)}
                        disabled={user.id === currentUserId}
                        className="bg-[#fbf9f4] border border-gray-200 text-xs p-2 focus:outline-none focus:border-[#1b3622] disabled:opacity-50"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(user.id)}
                        disabled={user.id === currentUserId}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors rounded-sm disabled:opacity-50"
                        aria-label="Remove admin user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
