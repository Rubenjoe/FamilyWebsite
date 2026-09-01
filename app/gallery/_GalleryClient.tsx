"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, Calendar } from "lucide-react";
import LightboxImage from "@/components/ui/LightboxImage";

export interface GalleryItemView {
  id: string;
  album: string | null;
  imageUrl: string;
  title: string;
  description?: string;
  year?: string;
  branch?: string;
}

interface GalleryClientProps {
  items: GalleryItemView[];
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");

  const branches = useMemo(() => {
    const values = new Set<string>();
    for (const item of items) {
      if (item.branch) values.add(item.branch);
    }
    return ["All Branches", ...Array.from(values).sort()];
  }, [items]);

  const groupedItems = useMemo(() => {
    const filtered =
      selectedBranch === "All Branches"
        ? items
        : items.filter((item) => item.branch === selectedBranch);

    const groups = new Map<string, GalleryItemView[]>();
    for (const item of filtered) {
      const key = item.branch || "Unspecified Branch";
      const list = groups.get(key) || [];
      list.push(item);
      groups.set(key, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items, selectedBranch]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12 relative z-10">
      <div className="space-y-2 border-b border-gray-100 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">
          The Media Vault
        </span>
        <h1 className="text-3xl md:text-4xl text-[#1b3622] font-normal font-serif">
          Historical Photographic Archive
        </h1>
      </div>

      {items.length > 0 && (
        <div className="space-y-3 pb-2 border-b border-gray-100">
          <span className="text-xs uppercase tracking-[0.12em] text-[#a57f12] font-bold block">
            Filter by Family Branch
          </span>
          <div className="flex flex-wrap gap-2">
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => setSelectedBranch(branch)}
                className={`px-3 py-2 text-xs uppercase tracking-[0.1em] font-medium transition-all cursor-pointer ${
                  selectedBranch === branch
                    ? "bg-[#1b3622] text-[#fbf9f4] font-semibold"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-[#1b3622]/30"
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 bg-white/40 space-y-3">
          <ImageIcon className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400 italic">
            No photographs have been added to the archive yet.
          </p>
        </div>
      ) : groupedItems.length > 0 ? (
        <div className="space-y-12">
          {groupedItems.map(([branch, groupItems]) => (
            <section key={branch} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-serif text-[#1b3622]">{branch}</h2>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  {groupItems.length} photo{groupItems.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="md:w-1/2 aspect-video md:aspect-square relative overflow-hidden bg-gray-50">
                      <LightboxImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>

                    <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.album && (
                            <span className="bg-[#1b3622]/5 text-[#1b3622] text-xs uppercase tracking-[0.1em] font-bold px-2 py-1">
                              {item.album}
                            </span>
                          )}
                          {item.year && (
                            <span className="text-gray-700 font-mono text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {item.year}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg text-[#2d312e] font-medium leading-snug">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 font-normal leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="text-xs uppercase tracking-[0.1em] text-[#a57f12] font-semibold pt-2 border-t border-gray-100">
                        Pulazhiyil Heritage Registry
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-200 bg-white/40 space-y-3">
          <ImageIcon className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400 italic">
            No media items cataloged under this branch yet.
          </p>
        </div>
      )}
    </div>
  );
}
