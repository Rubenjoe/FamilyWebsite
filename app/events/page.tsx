import { createClient } from "@/utils/supabase/server";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Database } from "@/types/supabase";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export const metadata = {
  title: "Events — Pulazhiyil Kudumbayogam",
  description: "Upcoming and past gatherings of the Pullazhiyil family.",
};

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,description,event_date,location")
    .order("event_date", { ascending: true })
    .returns<EventRow[]>();

  if (error) {
    console.error("Error loading events:", error);
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = (events || []).filter((e) => e.event_date >= today);
  const past = (events || []).filter((e) => e.event_date < today);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#fbf9f4] bg-parchment pb-24">
      <div className="bg-white border-b border-[#1b3622]/8 py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-3 animate-fade-up">
          <span className="text-xs uppercase tracking-[0.28em] text-[#a57f12] font-semibold block">
            Family Gatherings
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1b3622] font-light tracking-tight">
            Events &amp; Announcements
          </h1>
          <div className="w-16 h-0.5 bg-[#d4af37]" aria-hidden />
          <p className="text-gray-600 font-normal text-base md:text-lg pt-2 max-w-lg leading-relaxed">
            Upcoming assemblies and a record of past Pullazhiyil Kudumbayogam gatherings.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-14">
        <EventSection title="Upcoming Events" icon={Clock} events={upcoming} formatDate={formatDate} highlight />
        <EventSection title="Past Events" icon={Calendar} events={past} formatDate={formatDate} />
      </div>
    </div>
  );
}

function EventSection({
  title,
  icon: Icon,
  events,
  formatDate,
  highlight = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  events: EventRow[];
  formatDate: (date: string) => string;
  highlight?: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-[#1b3622]/10 pb-4">
        <Icon className="h-5 w-5 text-[#d4af37]" />
        <h2 className="text-2xl font-serif text-[#1b3622]">{title}</h2>
        <span className="ml-auto text-[11px] uppercase tracking-[0.15em] font-mono text-gray-500">
          {events.length} {events.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      {events.length === 0 ? (
        <div className="bg-white/60 border border-dashed border-[#1b3622]/15 p-10 text-center space-y-2">
          <Icon className="h-7 w-7 text-[#d4af37]/40 stroke-[1] mx-auto" />
          <p className="text-sm text-gray-500 font-light italic">
            No {title.toLowerCase()} to display.
          </p>
          <p className="text-xs text-gray-400 font-light">
            Announcements will appear here as the committee schedules them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <article
              key={event.id}
              className="animate-fade-up bg-white border border-[#1b3622]/10 shadow-sm hover:shadow-[0_16px_40px_rgba(27,54,34,0.10)] hover:border-[#d4af37]/30 hover:-translate-y-0.5 transition-all duration-500 ease-premium p-6 md:p-7 space-y-4"
              style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
            >
              {/* Prominent date block — dates carry the editorial weight here */}
              <div className="flex items-baseline gap-3 border-l-2 border-[#d4af37] pl-4">
                <span className="font-serif text-lg md:text-xl text-[#a57f12] font-medium leading-snug">
                  {formatDate(event.event_date)}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-normal text-[#1b3622] leading-snug">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  {event.description}
                </p>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium border-t border-gray-100 pt-3">
                  <MapPin className="h-4 w-4 text-[#d4af37] shrink-0" />
                  {event.location}
                </div>
              )}
              {highlight && (
                <span className="inline-flex items-center bg-[#1b3622] text-[#fbf9f4] text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1">
                  Upcoming
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
