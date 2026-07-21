import { MapPin } from "lucide-react";
import { MOCK_TIMELINE } from "../../data/mockData";

export default function TimelinePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">

            {/* Intro block */}
            <div className="text-center space-y-3 pb-6 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">Historical Milestones</span>
                <h1 className="text-3xl md:text-4xl text-[#1b3622] font-normal">Lineage Development Path</h1>
            </div>

            {/* Vertical Timeline Structure */}
            <div className="relative border-l border-gray-200 ml-4 md:ml-32 space-y-12 py-4">
                {MOCK_TIMELINE.map((event) => (
                    <div key={event.id} className="relative pl-8 group">

                        {/* Absolute Timeline Badge/Year for Desktop layout */}
                        <div className="hidden md:block absolute right-full mr-8 top-0 text-right">
                            <span className="font-serif text-2xl text-[#1b3622] font-semibold tracking-wide block">
                                {event.year}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-bold block mt-0.5">
                                Historical Epoch
                            </span>
                        </div>

                        {/* Central Timeline node indicator dot */}
                        <div className="absolute -left-[6px] top-2 w-3 h-3 rounded-full bg-white border-2 border-[#d4af37] group-hover:bg-[#1b3622] group-hover:border-[#1b3622] transition-colors" />

                        {/* Event Details Card */}
                        <div className="bg-white border border-gray-100 p-6 rounded-sm shadow-sm space-y-2">
                            <span className="inline-block md:hidden text-lg font-serif text-[#1b3622] font-bold mb-1">
                                {event.year} —
                            </span>
                            <h3 className="text-lg text-[#2d312e] font-medium leading-snug">{event.title}</h3>
                            <p className="text-xs text-gray-600 font-light leading-relaxed">{event.description}</p>

                            {event.location && (
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-light pt-2">
                                    <MapPin className="h-3.5 w-3.5 text-gray-300" />
                                    <span>{event.location}, Kerala</span>
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}