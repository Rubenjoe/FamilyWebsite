"use client";

import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";
import ImageUpload from "./ImageUpload";
import { Calendar } from "lucide-react";
import { GALLERY_BUCKET, resolveGalleryImageUrl } from "@/utils/storage";

type GalleryRow = Database["public"]["Tables"]["gallery_records"]["Row"];

export interface GalleryFormData {
  id?: string;
  title: string;
  album: string;
  branch: string;
  otherBranch?: string;
  year_label: string;
  description: string;
  image_path: string | null;
  is_published: boolean;
  sort_order: number;
}

interface GalleryFormProps {
  record?: GalleryRow | null;
  onSubmit: (data: GalleryFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
  onError: (message: string) => void;
}

const BRANCHES = [
  "Pullazhiyil",
  "Thanuvelil",
  "Thykurinjiyil",
  "Poovathumparambil",
  "Thyparampil",
  "Knanaya Samudhayam",
  "Other",
];

const EMPTY: GalleryFormData = {
  title: "",
  album: "",
  branch: "Pullazhiyil",
  otherBranch: "",
  year_label: "",
  description: "",
  image_path: null,
  is_published: true,
  sort_order: 0,
};

export default function GalleryForm({
  record,
  onSubmit,
  onCancel,
  isSaving,
  onError,
}: GalleryFormProps) {
  const [form, setForm] = useState<GalleryFormData>(EMPTY);

  useEffect(() => {
    if (!record) {
      setForm(EMPTY);
      return;
    }
    const isOther = !BRANCHES.includes(record.branch || "") || record.branch === "Other";
    setForm({
      id: record.id,
      title: record.title,
      album: record.album || "",
      branch: isOther ? "Other" : record.branch || "Pullazhiyil",
      otherBranch: isOther ? record.branch || "" : "",
      year_label: record.year_label || "",
      description: record.description || "",
      image_path: record.image_path,
      is_published: record.is_published,
      sort_order: record.sort_order,
    });
  }, [record]);

  const setField = <K extends keyof GalleryFormData>(key: K, value: GalleryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isOtherBranch = form.branch === "Other";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      onError("Title is required.");
      return;
    }
    if (!form.image_path) {
      onError("Please upload a photo before saving.");
      return;
    }
    const finalBranch = isOtherBranch ? form.otherBranch?.trim() || "Other" : form.branch;
    onSubmit({ ...form, branch: finalBranch });
  };

  const previewUrl = form.image_path ? resolveGalleryImageUrl(form.image_path) : null;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="bg-[#fbf9f4] border border-gray-100 p-4 space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
          Photo <span className="text-red-500">*</span>
        </label>
        <ImageUpload
          bucket={GALLERY_BUCKET}
          existingUrl={previewUrl}
          onUploaded={(path) => setField("image_path", path)}
          onError={onError}
          disabled={isSaving}
          returnPath
          useGalleryPath
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Ancestral Home Construction"
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Album / Category <span className="text-gray-300 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.album}
            onChange={(e) => setField("album", e.target.value)}
            placeholder="e.g. Historical"
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Branch
          </label>
          <select
            value={form.branch}
            onChange={(e) => setField("branch", e.target.value)}
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {isOtherBranch && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Other Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.otherBranch}
              onChange={(e) => setField("otherBranch", e.target.value)}
              className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Year
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="YYYY"
            value={form.year_label}
            onChange={(e) => setField("year_label", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={4}
          className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Display Order
          </label>
          <input
            type="number"
            min={0}
            value={form.sort_order}
            onChange={(e) => setField("sort_order", Math.max(0, Number(e.target.value) || 0))}
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-[#2d312e]">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setField("is_published", e.target.checked)}
            className="h-4 w-4 accent-[#1b3622]"
          />
          <span className="uppercase tracking-wider font-semibold">Publish on website</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold border border-gray-200 text-[#2d312e] hover:bg-[#fbf9f4] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-[#1b3622] text-[#fbf9f4] hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && (
            <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {record ? "Save Changes" : "Create Photo"}
        </button>
      </div>
    </form>
  );
}
