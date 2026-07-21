/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Image as ImageIcon, Calendar } from "lucide-react";
import { MOCK_GALLERY } from "../../data/mockData";

export default function GalleryPage() {
    const [selectedAlbum, setSelectedAlbum] = useState<string>("All");

    // Filtering matching media pieces
    const filteredGallery = MOCK_GALLERY.filter(item =>
        selectedAlbum === "All" || item.album === selectedAlbum
    );

    const albums = ["All", "Historical", "Reunions", "Weddings", "Ancestral Home"];

    return (
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">

            {/* Page Header */}
            <div className="space-y-2 border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">The Media Vault</span>
                <h1 className="text-3xl md:text-4xl text-[#1b3622] font-normal font-serif">Historical Photographic Archive</h1>
            </div>

            {/* Album Selector Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                {albums.map(album => (
                    <button
                        key={album}
                        onClick={() => setSelectedAlbum(album)}
                        className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all ${selectedAlbum === album
                            ? "bg-[#1b3622] text-[#fbf9f4] font-semibold"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-[#1b3622]/30"
                            }`}
                    >
                        {album}
                    </button>
                ))}
            </div>

            {/* Media Grid Matrix */}
            {filteredGallery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredGallery.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Image Frame Viewbox */}
                            <div className="md:w-1/2 aspect-video md:aspect-square relative overflow-hidden bg-gray-50">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>

                            {/* Informational Context Description Box */}
                            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#1b3622]/5 text-[#1b3622] text-[9px] uppercase tracking-widest font-bold px-2 py-0.5">
                                            {item.album}
                                        </span>
                                        {item.year && (
                                            <span className="text-gray-400 font-mono text-[10px] flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {item.year}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base text-[#2d312e] font-medium leading-snug">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-xs text-gray-500 font-light leading-relaxed">{item.description}</p>
                                    )}
                                </div>

                                <div className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold pt-2 border-t border-gray-50">
                                    Pulazhiyil Heritage Registry
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border border-dashed border-gray-200 bg-white/40 space-y-3">
                    <ImageIcon className="h-8 w-8 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-400 italic">No media items cataloged under this album group yet.</p>
                </div>
            )}

        </div>
    );
}