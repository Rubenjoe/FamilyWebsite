"use client";

import { useMemo, useState, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import type { Member } from "@/app/tree/FamilyTree";
import AdminPageHeader from "./AdminPageHeader";
import MemberForm from "./MemberForm";
import Toast, { useToast } from "./Toast";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";

type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];

interface MemberManagerProps {
  initialMembers: Member[];
}

export default function MemberManager({ initialMembers }: MemberManagerProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, closeToast } = useToast();
  const supabase = createClient();

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q)
    );
  }, [members, query]);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("members")
      .select("id,name,photo_url,birth_date,death_date,bio,father_id,mother_id,spouse_id")
      .order("name", { ascending: true })
      .returns<Member[]>();
    if (error) {
      showToast(error.message || "Failed to refresh members", "error");
    } else {
      setMembers(data || []);
    }
  }, [supabase, showToast]);

  const handleSave = useCallback(async (member: Partial<Member>, file?: File) => {
    setIsSaving(true);
    try {
      let photoUrl = member.photo_url || null;

      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `member-photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("member-photos")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("member-photos")
          .getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      if (member.id) {
        const updatePayload: MemberUpdate = {
          name: member.name ?? null,
          bio: member.bio ?? null,
          birth_date: member.birth_date ?? null,
          death_date: member.death_date ?? null,
          father_id: member.father_id ?? null,
          mother_id: member.mother_id ?? null,
          spouse_id: member.spouse_id ?? null,
          photo_url: photoUrl,
        };
        const { error } = await supabase
          .from("members")
          .update(updatePayload)
          .eq("id", member.id);
        if (error) throw error;
        showToast("Member updated successfully");
      } else {
        const insertPayload: MemberInsert = {
          name: member.name ?? null,
          bio: member.bio ?? null,
          birth_date: member.birth_date ?? null,
          death_date: member.death_date ?? null,
          father_id: member.father_id ?? null,
          mother_id: member.mother_id ?? null,
          spouse_id: member.spouse_id ?? null,
          photo_url: photoUrl,
        };
        const { error } = await supabase.from("members").insert(insertPayload);
        if (error) throw error;
        showToast("Member created successfully");
      }

      setEditingMember(null);
      setIsCreating(false);
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setIsSaving(false);
    }
  }, [supabase, showToast, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this member? This cannot be undone.")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      showToast(error.message || "Failed to delete member", "error");
    } else {
      showToast("Member deleted successfully");
      await refresh();
    }
  }, [supabase, showToast, refresh]);

  const formatDate = useCallback((date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  return (
    <div className="space-y-8">
      <Toast messages={toasts} onClose={closeToast} />
      <AdminPageHeader
        title="Registry Record Manager"
        subtitle="Search, add, edit, and delete family members."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1b3622]"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-[#1b3622] text-[#fbf9f4] px-4 py-2.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fbf9f4] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Photo</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Birth</th>
                <th className="px-4 py-3 text-left font-semibold">Death</th>
                <th className="px-4 py-3 text-left font-semibold">Parents</th>
                <th className="px-4 py-3 text-left font-semibold">Spouse</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 font-light">
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-50 last:border-b-0 hover:bg-[#fbf9f4]/50">
                    <td className="px-4 py-3">
                      {member.photo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={member.photo_url}
                          alt={member.name || "Member"}
                          className="h-10 w-10 rounded-full object-cover border border-[#1b3622]/10"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#1b3622]/5 flex items-center justify-center text-[10px] font-serif text-[#1b3622]">
                          {member.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2d312e]">{member.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(member.birth_date)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(member.death_date)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {member.father_id || member.mother_id ? "Set" : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {member.spouse_id ? "Set" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          className="p-1.5 text-[#1b3622] hover:bg-[#1b3622] hover:text-[#fbf9f4] transition-colors rounded-sm"
                          aria-label="Edit member"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                          aria-label="Delete member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isCreating || editingMember) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1b3622]/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1b3622]/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-serif text-[#1b3622]">
                {isCreating ? "Add New Member" : "Edit Member"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setIsCreating(false);
                }}
                className="p-1 text-gray-400 hover:text-[#1b3622]"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MemberForm
              member={editingMember}
              members={members}
              onSubmit={handleSave}
              onCancel={() => {
                setEditingMember(null);
                setIsCreating(false);
              }}
              isSaving={isSaving}
              onError={(message) => showToast(message, "error")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
