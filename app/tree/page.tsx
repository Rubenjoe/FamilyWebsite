import { Network, GitBranch, Search, ChevronRight } from "lucide-react";

export default function GenealogyTreePage() {
    return (
        <div className="min-h-screen bg-[#fbf9f4] pb-24">
            
            {/* Context Header */}
            <div className="bg-white border-b border-[#1b3622]/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold block">Interactive Lineage Map</span>
                        <h1 className="text-3xl md:text-4xl font-serif text-[#1b3622] font-normal">Ancestral Genealogy Tree</h1>
                        <p className="text-gray-500 font-light text-sm pt-2 max-w-lg">
                            Trace the descendants from the original founders across 4 mapped generations. 
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative w-64 hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Locate specific member..." 
                                className="w-full bg-[#fbf9f4] border border-gray-200 pl-9 pr-4 py-2 text-xs tracking-wide focus:outline-none focus:border-[#1b3622] text-[#2d312e]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tree Workspace Mockup */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="bg-white border border-gray-100 shadow-sm p-12 min-h-[600px] flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
                    
                    {/* Decorative background grid */}
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1b3622_1px,transparent_1px)] [background-size:24px_24px]"></div>

                    <div className="relative z-10 flex flex-col items-center space-y-4">
                        <div className="h-16 w-16 bg-[#fbf9f4] rounded-full flex items-center justify-center border border-[#d4af37]/40 shadow-sm">
                            <Network className="h-6 w-6 text-[#1b3622]" />
                        </div>
                        <h2 className="text-2xl font-serif text-[#1b3622]">Tree Visualizer Initializing</h2>
                        <p className="text-sm text-gray-500 font-light max-w-md mx-auto leading-relaxed">
                            The interactive D3.js kinship node graph is currently under construction. In the future, this canvas will display a draggable, zoomable map of all 440+ registered family records.
                        </p>
                        
                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                            <button className="bg-[#1b3622] text-[#fbf9f4] px-6 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors">
                                <GitBranch className="h-4 w-4" />
                                <span>Load Legacy View (Static)</span>
                            </button>
                            <button className="border border-gray-200 text-gray-600 px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:border-[#1b3622]/30 transition-colors">
                                Request Data Export
                            </button>
                        </div>
                    </div>

                    {/* Faux Tree Structural hint */}
                    <div className="absolute bottom-12 opacity-30 flex items-center justify-center gap-8 pointer-events-none">
                        <div className="border border-[#1b3622] p-4 text-[10px] uppercase tracking-widest font-bold w-32 bg-white">Patriarch Node</div>
                        <ChevronRight className="text-[#1b3622]" />
                        <div className="flex flex-col gap-4">
                            <div className="border border-[#1b3622] p-4 text-[10px] uppercase tracking-widest font-bold w-32 bg-white">Branch Alpha</div>
                            <div className="border border-[#1b3622] p-4 text-[10px] uppercase tracking-widest font-bold w-32 bg-white">Branch Beta</div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
