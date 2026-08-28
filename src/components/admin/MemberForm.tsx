"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Member } from "@/app/tree/FamilyTree";
import { Search, X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import DateInput from "./DateInput";

interface MemberFormProps {
  member: Member | null;
  members: Member[];
  onSubmit: (member: Partial<Member>, file?: File) => void;
  onCancel: () => void;
  isSaving: boolean;
  onError?: (message: string) => void;
}

function useMemberOptions(members: Member[], excludeId?: string | null) {
  return useMemo(
    () =>
      members
        .filter((m) => m.id !== excludeId)
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [members, excludeId]
  );
}

function RelationSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: Member[];
  onChange: (id: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((m) => m.id === value) || null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((m) => m.name?.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full bg-[#fbf9f4] border border-gray-200 text-xs px-3 py-2.5 text-left focus:outline-none focus:border-[#1b3622] flex items-center justify-between"
      >
        <span className={selected ? "text-[#2d312e]" : "text-gray-400"}>
          {selected ? selected.name : `Select ${label.toLowerCase()}...`}
        </span>
        <Search className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 shadow-lg mt-1">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-[#fbf9f4] border border-gray-200 text-xs px-3 py-2 focus:outline-none focus:border-[#1b3622]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-[#fbf9f4]"
            >
              None
            </button>
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#2d312e] hover:bg-[#fbf9f4]"
              >
                {m.name || "Unnamed"}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">No matches found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function hasCycle(
  memberId: string | undefined,
  proposedParentId: string | null,
  members: Member[]
): boolean {
  if (!proposedParentId) return false;
  if (memberId && proposedParentId === memberId) return true;

  const memberById = new Map(members.map((m) => [m.id, m]));
  const visited = new Set<string>();
  const queue = [memberId || ""];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);
    const current = memberById.get(currentId);
    if (!current) continue;
    if (current.father_id === proposedParentId || current.mother_id === proposedParentId) {
      return true;
    }
    if (current.father_id) queue.push(current.father_id);
    if (current.mother_id) queue.push(current.mother_id);
  }

  return false;
}

export default function MemberForm({
  member,
  members,
  onSubmit,
  onCancel,
  isSaving,
  onError,
}: MemberFormProps) {
  const [name, setName] = useState(member?.name || "");
  const [bio, setBio] = useState(member?.bio || "");
  const [birthDate, setBirthDate] = useState(member?.birth_date || "");
  const [deathDate, setDeathDate] = useState(member?.death_date || "");
  const [fatherId, setFatherId] = useState<string | null>(member?.father_id || null);
  const [motherId, setMotherId] = useState<string | null>(member?.mother_id || null);
  const [spouseId, setSpouseId] = useState<string | null>(member?.spouse_id || null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(member?.photo_url || null);
  const [file, setFile] = useState<File | undefined>();
  const [errors, setErrors] = useState<string[]>([]);

  const parentOptions = useMemberOptions(members, member?.id);
  const spouseOptions = useMemberOptions(members, member?.id);

  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setBio(member.bio || "");
      setBirthDate(member.birth_date || "");
      setDeathDate(member.death_date || "");
      setFatherId(member.father_id || null);
      setMotherId(member.mother_id || null);
      setSpouseId(member.spouse_id || null);
      setPhotoUrl(member.photo_url || null);
      setFile(undefined);
      setErrors([]);
    } else {
      setName("");
      setBio("");
      setBirthDate("");
      setDeathDate("");
      setFatherId(null);
      setMotherId(null);
      setSpouseId(null);
      setPhotoUrl(null);
      setFile(undefined);
      setErrors([]);
    }
  }, [member]);

  const handlePhotoUploaded = (url: string | null) => {
    setPhotoUrl(url);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setFile(undefined);
  };

  const validate = () => {
    const nextErrors: string[] = [];
    if (!name.trim()) nextErrors.push("Name is required.");
    if (hasCycle(member?.id, fatherId, [...members, ...(member ? [member] : [])])) {
      nextErrors.push("Selected father would create a cycle.");
    }
    if (hasCycle(member?.id, motherId, [...members, ...(member ? [member] : [])])) {
      nextErrors.push("Selected mother would create a cycle.");
    }
    if (fatherId && motherId && fatherId === motherId) {
      nextErrors.push("Father and mother cannot be the same person.");
    }
    if (spouseId === member?.id) {
      nextErrors.push("A member cannot be their own spouse.");
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(
      {
        id: member?.id,
        name: name.trim() || null,
        bio: bio.trim() || null,
        birth_date: birthDate || null,
        death_date: deathDate || null,
        father_id: fatherId,
        mother_id: motherId,
        spouse_id: spouseId,
        photo_url: photoUrl,
      },
      file
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs space-y-1">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
          />
        </div>

        <DateInput label="Birth Date" value={birthDate} onChange={setBirthDate} />
        <DateInput label="Death Date" value={deathDate} onChange={setDeathDate} />

        <div className="bg-[#fbf9f4] border border-gray-100 p-4 space-y-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
            Photo
          </label>
          <ImageUpload
            bucket="member-photos"
            folder="members"
            existingUrl={photoUrl}
            onUploaded={(url) => {
              handlePhotoUploaded(url);
              if (url) setFile(undefined);
            }}
            onError={onError}
            disabled={isSaving}
          />
          {photoUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isSaving}
              className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" /> Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <RelationSelect
          label="Father"
          value={fatherId}
          options={parentOptions}
          onChange={setFatherId}
        />
        <RelationSelect
          label="Mother"
          value={motherId}
          options={parentOptions}
          onChange={setMotherId}
        />
        <RelationSelect
          label="Spouse"
          value={spouseId}
          options={spouseOptions}
          onChange={setSpouseId}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
          Biography
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full bg-[#fbf9f4] border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-[#1b3622]"
        />
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
          {member ? "Save Changes" : "Create Member"}
        </button>
      </div>
    </form>
  );
}
