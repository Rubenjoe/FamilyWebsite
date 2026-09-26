"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import AdminPageHeader from "./AdminPageHeader";
import GalleryForm, { type GalleryFormData } from "./GalleryForm";
import Toast, { useToast } from "./Toast";
import { resolveGalleryImageUrl } from "@/utils/storage";

type GalleryRecordRow = Database["public"]["Tables"]["gallery_records"]["Row"];

interface GalleryManagerProps {
  initialRecords: GalleryRecordRow[];
}

const DEFAULT_CATEGORY_ORDER = ["Historic", "Event", "Outing", "Archive"];

export default function GalleryManager({ initialRecords }: GalleryManagerProps) {
  const [records, setRecords] = useState<GalleryRecordRow[]>(initialRecords);
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("All Branches");
  const [editingRecord, setEditingRecord] = useState<GalleryRecordRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, closeToast } = useToast();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("gallery_records")
      .select("*")
      .order("branch")
      .order("sort_order")
      .returns<GalleryRecordRow[]>();
    if (error) {
      showToast(error.message || "Failed to refresh gallery records", "error");
    } else {
      setRecords(data || []);
    }
  }, [supabase, showToast]);

  const branches = useMemo(() => {
    const values = new Set<string>();
    for (const r of records) {
      if (r.branch) values.add(r.branch);
    }
    return ["All Branches", ...Array.from(values).sort()];
  }, [records]);

  const groupedRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = records.filter((r) => {
      const matchesBranch = branchFilter === "All Branches" || r.branch === branchFilter;
      if (!matchesBranch) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.branch && r.branch.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.album && r.album.toLowerCase().includes(q)) ||
        (r.year_label && r.year_label.toLowerCase().includes(q))
      );
    });

    const groups = new Map<string, GalleryRecordRow[]>();
    for (const r of filtered) {
      const key = r.album?.trim() || "Archive";
      const list = groups.get(key) || [];
      list.push(r);
      groups.set(key, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
    }

    return Array.from(groups.entries()).sort(([a], [b]) => {
      const rankA = DEFAULT_CATEGORY_ORDER.indexOf(a);
      const rankB = DEFAULT_CATEGORY_ORDER.indexOf(b);
      if (rankA !== -1 && rankB !== -1) return rankA - rankB;
      if (rankA !== -1) return -1;
      if (rankB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [records, query, branchFilter]);

  const handleSave = useCallback(
    async (formData: GalleryFormData) => {
      setIsSaving(true);
      try {
        const payload = {
          title: formData.title.trim(),
          album: formData.album?.trim() || null,
          branch: formData.branch || null,
          year_label: formData.year_label.trim() || null,
          description: formData.description.trim() || null,
          image_path: formData.cloudinary_public_id || "", // For backward compatibility
          cloudinary_public_id: formData.cloudinary_public_id || null,
          cloudinary_secure_url: formData.cloudinary_secure_url || null,
          is_published: formData.is_published,
          sort_order: formData.sort_order,
        };

        const response = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: formData.id }),
        });
        const result = (await response.json()) as {
          error?: string;
          message?: string;
          warning?: string;
        };
        if (!response.ok) {
          throw new Error(result.error || "Save failed");
        }
        showToast(
          result.warning || result.message || "Gallery photo saved",
          result.warning ? "error" : "success"
        );

        setEditingRecord(null);
        setIsCreating(false);
        await refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Save failed", "error");
      } finally {
        setIsSaving(false);
      }
    },
    [showToast, refresh]
  );

  const handleDelete = useCallback(
    async (record: GalleryRecordRow) => {
      if (!confirm(`Delete "${record.title}"? This cannot be undone.`)) return;
      try {
        const response = await fetch("/api/admin/gallery", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: record.id }),
        });
        const result = (await response.json()) as {
          error?: string;
          message?: string;
          warning?: string;
        };
        if (!response.ok) throw new Error(result.error || "Delete failed");
        showToast(
          result.warning || result.message || "Gallery photo deleted",
          result.warning ? "error" : "success"
        );
        await refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Delete failed", "error");
      }
    },
    [showToast, refresh]
  );

  return (
    <div className="space-y-8">
      <Toast messages={toasts} onClose={closeToast} />
      <AdminPageHeader
        title="Gallery Photos"
        subtitle="Upload and organize family photographs by category and branch." />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#1b3622] min-h-[44px]"
            />
          </div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-white border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622] min-h-[44px] w-full sm:w-auto"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 bg-[#1b3622] text-[#fbf9f4] px-4 py-2.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors min-h-[44px] w-full sm:w-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Photo
        </button>
      </div>

      {groupedRecords.length === 0 ? (
        <div className="bg-white border border-gray-100 p-12 text-center text-gray-400 text-xs">
          No gallery photos match your filters.
        </div>
      ) : (
        groupedRecords.map(([album, items]) => (
          <div key={album} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-serif text-[#1b3622] font-medium">{album}</h2>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                {items.length} photo{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-100 overflow-hidden group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={record.cloudinary_secure_url || resolveGalleryImageUrl(record.image_path)}
                        alt={record.title}
                        className="h-full w-full object-cover"
                      />
                      {/* Desktop hover actions */}
                      <div className="hidden sm:flex absolute inset-0 bg-[#1b3622]/0 group-hover:bg-[#1b3622]/40 transition-colors items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setEditingRecord(record)}
                          className="p-2 bg-white text-[#1b3622] hover:bg-[#d4af37] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm"
                          aria-label="Edit photo"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record)}
                          className="p-2 bg-white text-red-600 hover:bg-red-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm"
                          aria-label="Delete photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h3 className="text-xs font-medium text-[#2d312e] break-words">{record.title}</h3>
                      <p className="text-[10px] text-[#a57f12] truncate">
                        {record.branch || "—"}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {record.is_published ? "Published" : "Draft"}
                        {record.year_label ? ` · ${record.year_label}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Mobile-visible actions on touch devices */}
                  <div className="sm:hidden px-4 pb-3 pt-1 flex items-center gap-2 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setEditingRecord(record)}
                      className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#fbf9f4] text-[#1b3622] border border-[#1b3622]/15 text-[11px] font-medium rounded-sm active:bg-[#d4af37]"
                      aria-label="Edit photo"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      className="min-h-[40px] px-3.5 py-1.5 flex items-center justify-center gap-1.5 text-red-600 bg-red-50/60 border border-red-200 text-[11px] font-medium rounded-sm active:bg-red-100"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {(isCreating || editingRecord) && (
        <div className="admin-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1b3622]/60 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
          <div className="admin-modal-panel bg-white w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex flex-col my-auto shadow-2xl border border-[#1b3622]/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-serif text-[#1b3622]">
                {editingRecord ? "Edit Gallery Photo" : "Add Gallery Photo"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setIsCreating(false);
                }}
                className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-gray-400 hover:text-[#1b3622]"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <GalleryForm
              record={editingRecord}
              records={records}
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
