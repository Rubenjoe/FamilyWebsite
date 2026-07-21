import { Search as SearchIcon, Filter, Users, Calendar, FileText } from "lucide-react";

export default function GlobalSearchPage() {
    return (
        <div className="min-h-screen bg-[#fbf9f4] pb-24 pt-12">
            <div className="max-w-4xl mx-auto px-6 space-y-12">
                
                {/* Search Header */}
                <div className="space-y-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-serif text-[#1b3622]">Universal Archive Search</h1>
                    <p className="text-gray-500 font-light text-sm max-w-lg mx-auto">
                        Locate specific ancestor records, historical milestones, uploaded deeds, and upcoming gathering events across the entire digital archive.
                    </p>
                    
                    {/* Big Search Input */}
                    <div className="relative max-w-2xl mx-auto shadow-sm group">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#d4af37] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Enter a name, year, or keyword..." 
                            className="w-full bg-white border border-[#1b3622]/10 pl-16 pr-6 py-5 text-sm tracking-wide focus:outline-none focus:border-[#d4af37] text-[#2d312e] transition-colors"
                            autoFocus
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1b3622] text-[#fbf9f4] px-6 py-2.5 text-[10px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors">
                            Search
                        </button>
                    </div>
                </div>

                {/* Filter / Suggestions Blocks */}
                <div className="bg-white border border-gray-100 shadow-sm p-8 space-y-8">
                    
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                        <Filter className="h-4 w-4 text-[#d4af37]" />
                        <h2 className="text-xs uppercase tracking-widest font-bold text-[#1b3622]">Suggested Search Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-3 cursor-pointer group">
                            <div className="flex items-center gap-2 text-[#2d312e]">
                                <Users className="h-4 w-4 group-hover:text-[#d4af37] transition-colors" />
                                <span className="text-sm font-semibold">Members & Lineage</span>
                            </div>
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Search by branch names, professions, or specific generations.</p>
                        </div>

                        <div className="space-y-3 cursor-pointer group">
                            <div className="flex items-center gap-2 text-[#2d312e]">
                                <Calendar className="h-4 w-4 group-hover:text-[#d4af37] transition-colors" />
                                <span className="text-sm font-semibold">Gatherings</span>
                            </div>
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Find upcoming summits or trace past historic milestone assemblies.</p>
                        </div>

                        <div className="space-y-3 cursor-pointer group">
                            <div className="flex items-center gap-2 text-[#2d312e]">
                                <FileText className="h-4 w-4 group-hover:text-[#d4af37] transition-colors" />
                                <span className="text-sm font-semibold">Registry Documents</span>
                            </div>
                            <p className="text-xs text-gray-400 font-light leading-relaxed">Search for specific constitutions, deeds, or public archive records.</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
