"use client";

import { useState, useEffect } from "react";
import type { Database } from "@/types/supabase";
import ImageUpload from "./ImageUpload";
import { Calendar } from "lucide-react";
import { HERITAGE_BUCKET, resolveStorageUrl } from "@/utils/storage";

type CommitteeRow = Database["public"]["Tables"]["committee_members"]["Row"];

export interface CommitteeFormData {
  id?: string;
  committee_year: number;
  name: string;
  role: string;
  branch: string;
  otherBranch?: string;
  location: string;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
}

interface CommitteeFormProps {
  record?: CommitteeRow | null;
  onSubmit: (data: CommitteeFormData) => void;
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

const ROLES = [
  "President",
  "Secretary",
  "Treasurer",
  "Vice President",
  "Joint Secretary",
  "Committee Member",
];

const EMPTY: CommitteeFormData = {
  committee_year: new Date().getFullYear(),
  name: "",
  role: "Committee Member",
  branch: "Pullazhiyil",
  otherBranch: "",
  location: "",
  image_url: null,
  is_published: true,
  sort_order: 0,
};

export default function CommitteeForm({
  record,
  onSubmit,
  onCancel,
  isSaving,
  onError,
}: CommitteeFormProps) {
  const [form, setForm] = useState<CommitteeFormData>(EMPTY);

  useEffect(() => {
    if (!record) {
      setForm(EMPTY);
      return;
    }
    const isOther = !BRANCHES.includes(record.branch || "") || record.branch === "Other";
    setForm({
      id: record.id,
      committee_year: record.committee_year,
      name: record.name,
      role: record.role,
      branch: isOther ? "Other" : record.branch || "Pullazhiyil",
      otherBranch: isOther ? record.branch || "" : "",
      location: record.location || "",
      image_url: record.image_url,
      is_published: record.is_published,
      sort_order: record.sort_order,
    });
  }, [record]);

  const setField = <K extends keyof CommitteeFormData>(key: K, value: CommitteeFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isOtherBranch = form.branch === "Other";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      onError("Name is required.");
      return;
    }
    if (!form.role.trim()) {
      onError("Role is required.");
      return;
    }
    if (form.committee_year < 1900 || form.committee_year > 2100) {
      onError("Please enter a valid year between 1900 and 2100.");
      return;
    }
    const finalBranch = isOtherBranch ? form.otherBranch?.trim() || "Other" : form.branch;
    onSubmit({ ...form, branch: finalBranch });
  };

  const previewUrl = form.image_url ? resolveStorageUrl(HERITAGE_BUCKET, form.image_url) : null;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Committee Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1900}
            max={2100}
            required
            value={form.committee_year}
            onChange={(e) => setField("committee_year", parseInt(e.target.value) || new Date().getFullYear())}
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Joemon Thomas Thanuvelil"
          className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
        />
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
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="e.g. Kerala"
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>
      </div>

      <div className="bg-[#fbf9f4] border border-gray-100 p-4 space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
          Photo
        </label>
        <ImageUpload
          bucket={HERITAGE_BUCKET}
          existingUrl={previewUrl}
          onUploaded={(path) => setField("image_url", path)}
          onError={onError}
          disabled={isSaving}
          returnPath
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
          {record ? "Save Changes" : "Add Committee Member"}
        </button>
      </div>
    </form>
  );
}
