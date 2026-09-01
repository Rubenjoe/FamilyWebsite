"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Filter } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import AdminPageHeader from "./AdminPageHeader";
import HeritageForm, { type HeritageFormData } from "./HeritageForm";
import Toast, { useToast } from "./Toast";

type HeritageRecordRow = Database["public"]["Tables"]["heritage_records"]["Row"];
type HeritageRecordKind = HeritageRecordRow["kind"];

type FilterKind = HeritageRecordKind | "all";

const KINDS: { value: FilterKind; label: string }[] = [
  { value: "all", label: "All sections" },
  { value: "obituary", label: "Obituary" },
  { value: "achiever", label: "Achiever" },
  { value: "evangelist", label: "Evangelist" },
  { value: "committee", label: "Committee" },
];

type HeritagePayload = {
  kind: HeritageRecordKind;
  name: string;
  branch: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  year_label: string | null;
  birth_year: string | null;
  death_year: string | null;
  tribute: string | null;
  location: string | null;
  is_published: boolean;
  sort_order: number;
};

interface HeritageManagerProps {
  initialRecords: HeritageRecordRow[];
}

export default function HeritageManager({ initialRecords }: HeritageManagerProps) {
  const [records, setRecords] = useState<HeritageRecordRow[]>(initialRecords);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<FilterKind>("all");
  const [editingRecord, setEditingRecord] = useState<HeritageRecordRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, closeToast } = useToast();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("heritage_records")
      .select("*")
      .order("kind")
      .order("sort_order")
      .returns<HeritageRecordRow[]>();
    if (error) {
      showToast(error.message || "Failed to refresh records", "error");
    } else {
      setRecords(data || []);
    }
  }, [supabase, showToast]);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      const matchesKind = kindFilter === "all" || r.kind === kindFilter;
      if (!matchesKind) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }, [records, query, kindFilter]);

  const handleSave = useCallback(
    async (formData: HeritageFormData) => {
      setIsSaving(true);
      try {
        const payload: HeritagePayload = {
          kind: formData.kind,
          name: formData.name.trim(),
          branch: formData.branch,
          title: formData.title.trim() || null,
          description: formData.description.trim() || null,
          image_url: formData.image_url || null,
          year_label: formData.year_label.trim() || null,
          birth_year: formData.birth_year.trim() || null,
          death_year: formData.death_year.trim() || null,
          tribute: formData.tribute.trim() || null,
          location: formData.location.trim() || null,
          is_published: formData.is_published,
          sort_order: formData.sort_order,
        };

        if (formData.id) {
          const { error } = await supabase
            .from("heritage_records")
            .update(payload)
            .eq("id", formData.id);
          if (error) throw error;
          showToast("Heritage record updated");
        } else {
          const { error } = await supabase.from("heritage_records").insert(payload);
          if (error) throw error;
          showToast("Heritage record created");
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
    async (id: string) => {
      if (!confirm("Delete this heritage record? This cannot be undone.")) return;
      const { error } = await supabase.from("heritage_records").delete().eq("id", id);
      if (error) {
        showToast(error.message || "Delete failed", "error");
      } else {
        showToast("Record deleted");
        await refresh();
      }
    },
    [supabase, showToast, refresh]
  );

  return (
    <div className="space-y-8">
      <Toast messages={toasts} onClose={closeToast} />
      <AdminPageHeader
        title="Heritage Records"
        subtitle="Add and maintain public obituaries, achievers, evangelists, and committee members."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1b3622]"
            />
          </div>
          <div className="relative flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as FilterKind)}
              className="bg-white border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-[#1b3622] text-[#fbf9f4] px-4 py-2.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fbf9f4] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Photo</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Section</th>
                <th className="px-4 py-3 text-left font-semibold">Branch</th>
                <th className="px-4 py-3 text-left font-semibold">Subtitle</th>
                <th className="px-4 py-3 text-left font-semibold">Published</th>
                <th className="px-4 py-3 text-right font-semibold">Order</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-light">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
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
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-[#1b3622]/5 text-[#1b3622] px-2 py-1 border border-[#1b3622]/10">
                        {record.kind.charAt(0).toUpperCase() + record.kind.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{record.branch}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {record.title || "—"}
                    </td>
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
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                          aria-label="Delete record"
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

      {(isCreating || editingRecord) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1b3622]/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-3xl my-8 shadow-2xl border border-[#1b3622]/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-serif text-[#1b3622]">
                {editingRecord ? "Edit Heritage Record" : "Add Heritage Record"}
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
            <HeritageForm
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
