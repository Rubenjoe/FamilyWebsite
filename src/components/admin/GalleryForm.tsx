"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { Database } from "@/types/supabase";
import CloudinaryUpload from "./CloudinaryUpload";
import { Calendar } from "lucide-react";

type GalleryRow = Database["public"]["Tables"]["gallery_records"]["Row"];

export interface GalleryFormData {
  id?: string;
  title: string;
  album: string;
  branch: string;
  otherBranch?: string;
  year_label: string;
  description: string;
  cloudinary_public_id: string;
  cloudinary_secure_url: string;
  is_published: boolean;
  sort_order: number;
}

interface GalleryFormProps {
  record?: GalleryRow | null;
  records?: GalleryRow[];
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

const DEFAULT_CATEGORIES = ["Historic", "Event", "Outing"];
const CREATE_NEW_VALUE = "__create_new__";
const UNCATEGORIZED_VALUE = "";

const EMPTY: GalleryFormData = {
  title: "",
  album: "",
  branch: "Pullazhiyil",
  otherBranch: "",
  year_label: "",
  description: "",
  cloudinary_public_id: "",
  cloudinary_secure_url: "",
  is_published: true,
  sort_order: 0,
};

export default function GalleryForm({
  record,
  records = [],
  onSubmit,
  onCancel,
  isSaving,
  onError,
}: GalleryFormProps) {
  const [form, setForm] = useState<GalleryFormData>(EMPTY);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectValue, setSelectValue] = useState<string>(UNCATEGORIZED_VALUE);
  const selectId = useId();
  const newCategoryId = useId();

  const knownCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    for (const r of records) {
      const album = r.album?.trim();
      if (album) set.add(album);
    }
    return Array.from(set);
  }, [records]);

  useEffect(() => {
    if (!record) {
      setForm(EMPTY);
      setSelectValue(UNCATEGORIZED_VALUE);
      setNewCategoryName("");
      return;
    }
    const isOther = !BRANCHES.includes(record.branch || "") || record.branch === "Other";
    const album = record.album || "";
    setForm({
      id: record.id,
      title: record.title,
      album,
      branch: isOther ? "Other" : record.branch || "Pullazhiyil",
      otherBranch: isOther ? record.branch || "" : "",
      year_label: record.year_label || "",
      description: record.description || "",
      cloudinary_public_id: record.cloudinary_public_id || "",
      cloudinary_secure_url: record.cloudinary_secure_url || "",
      is_published: record.is_published,
      sort_order: record.sort_order,
    });
    setSelectValue(knownCategories.includes(album) ? album : album ? CREATE_NEW_VALUE : UNCATEGORIZED_VALUE);
    setNewCategoryName(knownCategories.includes(album) ? "" : album);
  }, [record, knownCategories]);

  const setField = <K extends keyof GalleryFormData>(key: K, value: GalleryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isOtherBranch = form.branch === "Other";

  const handleCategorySelect = (value: string) => {
    setSelectValue(value);
    if (value !== CREATE_NEW_VALUE) {
      setNewCategoryName("");
      setField("album", value === UNCATEGORIZED_VALUE ? "" : value);
    }
  };

  const handleNewCategoryChange = (value: string) => {
    setNewCategoryName(value);
    setField("album", value.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectValue === CREATE_NEW_VALUE && !newCategoryName.trim()) {
      onError("Please enter a new category name.");
      return;
    }
    if (!form.title.trim()) {
      onError("Title is required.");
      return;
    }
    if (!form.cloudinary_public_id) {
      onError("Please upload a photo before saving.");
      return;
    }
    const finalBranch = isOtherBranch ? form.otherBranch?.trim() || "Other" : form.branch;
    const finalAlbum = selectValue === CREATE_NEW_VALUE ? newCategoryName.trim() : form.album.trim();
    onSubmit({ ...form, branch: finalBranch, album: finalAlbum });
  };

  const handleCloudinaryUpload = (publicId: string, secureUrl: string) => {
    setField("cloudinary_public_id", publicId);
    setField("cloudinary_secure_url", secureUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
      <div className="bg-[#fbf9f4] border border-gray-100 p-4 space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
          Photo <span className="text-red-500">*</span>
        </label>
        <CloudinaryUpload
          existingUrl={form.cloudinary_secure_url}
          onUploaded={handleCloudinaryUpload}
          onError={onError}
          disabled={isSaving}
          year={form.year_label}
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
          <label htmlFor={selectId} className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Album / Category <span className="text-gray-300 font-normal">(optional)</span>
          </label>
          <select
            id={selectId}
            value={selectValue}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622] min-h-[44px]"
          >
            <option value={UNCATEGORIZED_VALUE}>— Select category —</option>
            {knownCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value={CREATE_NEW_VALUE}>+ Create new category</option>
          </select>

          {selectValue === CREATE_NEW_VALUE && (
            <div className="pt-2 space-y-1">
              <label htmlFor={newCategoryId} className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                New category name
              </label>
              <input
                id={newCategoryId}
                type="text"
                value={newCategoryName}
                onChange={(e) => handleNewCategoryChange(e.target.value)}
                placeholder="e.g. Wedding"
                className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
              />
            </div>
          )}
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
        <label className="flex items-center gap-2 text-xs text-[#2d312e] min-h-[44px]">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setField("is_published", e.target.checked)}
            className="h-4 w-4 accent-[#1b3622]"
          />
          <span className="uppercase tracking-wider font-semibold">Publish on website</span>
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-3 text-xs uppercase tracking-widest font-semibold border border-gray-200 text-[#2d312e] hover:bg-[#fbf9f4] transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-3 text-xs uppercase tracking-widest font-semibold bg-[#1b3622] text-[#fbf9f4] hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
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
