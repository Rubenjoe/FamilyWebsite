"use client";

import { FileText, Download, ShieldCheck, Folder } from "lucide-react";
import { MOCK_DOCUMENTS } from "../../data/mockData";

export default function DocumentsPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">

            {/* Intro section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">The Document Vault</span>
                    <h1 className="text-3xl md:text-4xl text-[#1b3622] font-normal font-serif">Historical Literature & Deeds</h1>
                </div>
                <div className="bg-[#1b3622] text-[#fbf9f4] px-4 py-2.5 rounded-sm flex items-center gap-2 text-xs font-mono">
                    <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
                    <span>Verified Public Archive</span>
                </div>
            </div>

            {/* Asset Repository Layout rows */}
            <div className="space-y-4">
                {MOCK_DOCUMENTS.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-white border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm hover:border-[#1b3622]/20 transition-colors"
                    >
                        {/* Left description area */}
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-gray-100 text-gray-600 px-2 py-0.5 font-semibold">
                                    <Folder className="h-3 w-3 text-gray-400" />
                                    {doc.category}
                                </span>
                                <span className="text-gray-400 font-mono text-[10px]">Added: {doc.dateAdded}</span>
                            </div>
                            <h3 className="text-lg text-[#2d312e] font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[#1b3622] shrink-0" />
                                <span>{doc.title}</span>
                            </h3>
                            <p className="text-xs text-gray-500 font-light leading-relaxed">{doc.description}</p>
                        </div>

                        {/* Action Download interaction area */}
                        <div className="w-full sm:w-auto flex sm:flex-col items-end gap-1.5 justify-between sm:justify-center border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0 shrink-0">
                            <span className="text-[10px] font-mono text-gray-400 block">Size: {doc.fileSize}</span>
                            <button
                                onClick={() => alert(`Simulating file stream download trigger for: ${doc.title}`)}
                                className="inline-flex items-center gap-2 border border-[#1b3622] text-[#1b3622] text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#1b3622] hover:text-[#fbf9f4] transition-all"
                            >
                                <Download className="h-3 w-3" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}