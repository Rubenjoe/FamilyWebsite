import { MapPin, Clock, CheckCircle2 } from "lucide-react";
import { MOCK_EVENTS } from "../../data/mockData";

export default function EventsPage() {
    const upcomingEvents = MOCK_EVENTS.filter(e => e.status === "upcoming");
    const pastEvents = MOCK_EVENTS.filter(e => e.status === "past");

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

            {/* Section Head */}
            <div className="space-y-2 border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block">Family Assembly Board</span>
                <h1 className="text-3xl md:text-4xl text-[#1b3622] font-normal">Gatherings & Reunions</h1>
            </div>

            {/* Grid Layout System */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Left Grid Area: Upcoming Schedule Cards */}
                <div className="lg:col-span-7 space-y-6">
                    <h2 className="text-xs uppercase tracking-widest text-[#1b3622] font-bold tracking-[0.15em] border-b border-gray-100 pb-2">
                        Scheduled Upcoming Assemblies
                    </h2>

                    {upcomingEvents.map(event => (
                        <div key={event.id} className="bg-white border border-l-4 border-l-[#d4af37] border-gray-100 p-6 space-y-4 shadow-sm">
                            <div className="space-y-1">
                                <span className="text-xs text-[#d4af37] font-semibold tracking-wider block">
                                    {new Date(event.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <h3 className="text-xl text-[#1b3622] font-medium">{event.title}</h3>
                            </div>
                            <p className="text-xs text-gray-600 font-light leading-relaxed">{event.description}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-gray-500 font-light border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                </div>
                                {event.time && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span>{event.time}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Grid Area: Past Historic Record Compilations */}
                <div className="lg:col-span-5 bg-white p-6 border border-gray-100 space-y-6 shadow-sm rounded-sm">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">
                        Concluded Celebrations
                    </h2>

                    {pastEvents.map(event => (
                        <div key={event.id} className="space-y-2 opacity-75 group hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
                                <CheckCircle2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                <span>{new Date(event.date).getFullYear()} Completed</span>
                            </div>
                            <h3 className="text-base text-[#2d312e] font-medium leading-snug">{event.title}</h3>
                            <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed">{event.description}</p>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}