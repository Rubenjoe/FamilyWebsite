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
    new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#fbf9f4] pb-20">
      <div className="bg-white border-b border-[#1b3622]/5 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold block">
            Family Gatherings
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1b3622]">Events & Announcements</h1>
          <p className="text-gray-600 font-normal text-base pt-2 max-w-lg">
            Upcoming assemblies and a record of past Pullazhiyil Kudumbayogam gatherings.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <EventSection title="Upcoming Events" icon={Clock} events={upcoming} formatDate={formatDate} />
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
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  events: EventRow[];
  formatDate: (date: string) => string;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-serif text-[#1b3622] flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#d4af37]" />
        {title}
      </h2>
      {events.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400 font-light italic">No {title.toLowerCase()} to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-100 p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <span className="text-sm uppercase tracking-[0.12em] font-mono text-[#a57f12] font-bold block">
                  {formatDate(event.event_date)}
                </span>
                <h3 className="text-xl font-serif font-medium text-[#1b3622]">{event.title}</h3>
              </div>
              {event.description && (
                <p className="text-base text-gray-600 font-normal leading-relaxed">
                  {event.description}
                </p>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium pt-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
