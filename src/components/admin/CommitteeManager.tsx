"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import AdminPageHeader from "./AdminPageHeader";
import CommitteeForm, { type CommitteeFormData } from "./CommitteeForm";
import Toast, { useToast } from "./Toast";

type CommitteeRow = Database["public"]["Tables"]["committee_members"]["Row"];

interface CommitteeManagerProps {
  initialRecords: CommitteeRow[];
}

export default function CommitteeManager({ initialRecords }: CommitteeManagerProps) {
  const [records, setRecords] = useState<CommitteeRow[]>(initialRecords);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("All Years");
  const [editingRecord, setEditingRecord] = useState<CommitteeRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, closeToast } = useToast();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("committee_members")
      .select("*")
      .order("committee_year", { ascending: false })
      .order("sort_order")
      .returns<CommitteeRow[]>();
    if (error) {
      showToast(error.message || "Failed to refresh committee records", "error");
    } else {
      setRecords(data || []);
    }
  }, [supabase, showToast]);

  const years = useMemo(() => {
    const values = new Set<number>();
    for (const r of records) {
      values.add(r.committee_year);
    }
    const sortedYears = Array.from(values).sort((a, b) => b - a);
    return ["All Years", ...sortedYears.map(String)];
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = records.filter((r) => {
      const matchesYear = yearFilter === "All Years" || r.committee_year.toString() === yearFilter;
      if (!matchesYear) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        (r.branch && r.branch.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q))
      );
    });

    return filtered.sort((a, b) => {
      if (a.committee_year !== b.committee_year) {
        return b.committee_year - a.committee_year;
      }
      return a.sort_order - b.sort_order;
    });
  }, [records, query, yearFilter]);

  const groupedRecords = useMemo(() => {
    const groups = new Map<number, CommitteeRow[]>();
    for (const r of filteredRecords) {
      const list = groups.get(r.committee_year) || [];
      list.push(r);
      groups.set(r.committee_year, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.sort_order - b.sort_order);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => b - a);
  }, [filteredRecords]);

  const handleSave = useCallback(
    async (formData: CommitteeFormData) => {
      setIsSaving(true);
      try {
        const payload = {
          committee_year: formData.committee_year,
          name: formData.name.trim(),
          role: formData.role.trim(),
          branch: formData.branch || null,
          location: formData.location.trim() || null,
          image_url: formData.image_url || null,
          is_published: formData.is_published,
          sort_order: formData.sort_order,
        };

        if (formData.id) {
          const { error } = await supabase
            .from("committee_members")
            .update(payload)
            .eq("id", formData.id);
          if (error) throw error;
          showToast("Committee member updated");
        } else {
          const { error } = await supabase.from("committee_members").insert(payload);
          if (error) throw error;
          showToast("Committee member added");
        }

        setEditingRecord(null);
        setIsCreating(false);
        await refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Save failed", "error");
      } finally {
        setIsSaving(false);
      }
    },
    [supabase, showToast, refresh]
  );

  const handleDelete = useCallback(
    async (record: CommitteeRow) => {
      if (!confirm(`Delete "${record.name}" from ${record.committee_year}? This cannot be undone.`)) return;
      const { error } = await supabase.from("committee_members").delete().eq("id", record.id);
      if (error) {
        showToast(error.message || "Delete failed", "error");
      } else {
        showToast("Committee member deleted");
        await refresh();
      }
    },
    [supabase, showToast, refresh]
  );

  return (
    <div className="space-y-8">
      <Toast messages={toasts} onClose={closeToast} />
      <AdminPageHeader
        title="Executive Committee"
        subtitle="Manage committee members organized by year."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search committee members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1b3622]"
            />
          </div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-white border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
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

      {groupedRecords.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center text-gray-400 text-xs">
          No committee records match your filters.
        </div>
      ) : (
        groupedRecords.map(([year, items]) => (
          <div key={year} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-serif text-[#1b3622] font-medium">{year}</h2>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                {items.length} member{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#fbf9f4] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Photo</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Role</th>
                      <th className="px-4 py-3 text-left font-semibold">Branch</th>
                      <th className="px-4 py-3 text-left font-semibold">Location</th>
                      <th className="px-4 py-3 text-left font-semibold">Published</th>
                      <th className="px-4 py-3 text-right font-semibold">Order</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-[#fbf9f4]/50"
                      >
                        <td className="px-4 py-3">
                          {record.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={record.image_url}
                              alt={record.name}
                              className="h-10 w-10 rounded-sm object-cover border border-[#1b3622]/10"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-sm bg-[#1b3622]/5 flex items-center justify-center text-[10px] font-serif text-[#1b3622]">
                              ?
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#2d312e]">{record.name}</td>
                        <td className="px-4 py-3 text-gray-500">{record.role}</td>
                        <td className="px-4 py-3 text-gray-500">{record.branch || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{record.location || "—"}</td>
                        <td className="px-4 py-3">
                          {record.is_published ? (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-green-700 bg-green-50 px-2 py-1 border border-green-200">
                              Yes
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-50 px-2 py-1 border border-gray-200">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{record.sort_order}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingRecord(record)}
                              className="p-1.5 text-[#1b3622] hover:bg-[#1b3622] hover:text-[#fbf9f4] transition-colors rounded-sm"
                              aria-label="Edit record"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(record)}
                              className="p-1.5 text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                              aria-label="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {(isCreating || editingRecord) && (
        <div className="admin-modal-overlay fixed inset-0 z-50 grid place-items-center bg-[#1b3622]/60 p-4 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
          <div className="admin-modal-panel bg-white w-full max-w-3xl my-8 shadow-2xl border border-[#1b3622]/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-serif text-[#1b3622]">
                {editingRecord ? "Edit Committee Member" : "Add Committee Member"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setIsCreating(false);
                }}
                className="p-1 text-gray-400 hover:text-[#1b3622]"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CommitteeForm
              record={editingRecord}
              onSubmit={handleSave}
              onCancel={() => {
                setEditingRecord(null);
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
