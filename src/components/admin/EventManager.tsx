"use client";

import { useMemo, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Calendar } from "lucide-react";
import type { Database } from "@/types/supabase";
import AdminPageHeader from "./AdminPageHeader";
import EventForm from "./EventForm";
import Toast, { useToast } from "./Toast";
import { createClient } from "@/utils/supabase/client";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

interface EventManagerProps {
  initialEvents: EventRow[];
}

export default function EventManager({ initialEvents }: EventManagerProps) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showToast, closeToast } = useToast();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id,title,description,event_date,location,created_at,created_by")
      .order("event_date", { ascending: true })
      .returns<EventRow[]>();
    if (error) {
      showToast(error.message || "Failed to refresh events", "error");
    } else {
      setEvents(data || []);
    }
  }, [supabase, showToast]);

  const handleSave = useCallback(async (event: Partial<EventRow>) => {
    setIsSaving(true);
    try {
      if (event.id) {
        const updatePayload: EventUpdate = {
          title: event.title,
          description: event.description ?? null,
          event_date: event.event_date,
          location: event.location ?? null,
        };
        const { error } = await supabase
          .from("events")
          .update(updatePayload)
          .eq("id", event.id);
        if (error) throw error;
        showToast("Event updated successfully");
      } else {
        const insertPayload: EventInsert = {
          title: event.title || "",
          description: event.description ?? null,
          event_date: event.event_date || "",
          location: event.location ?? null,
        };
        const { error } = await supabase.from("events").insert(insertPayload);
        if (error) throw error;
        showToast("Event created successfully");
      }
      setEditingEvent(null);
      setIsCreating(false);
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setIsSaving(false);
    }
  }, [supabase, showToast, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      showToast(error.message || "Failed to delete event", "error");
    } else {
      showToast("Event deleted successfully");
      await refresh();
    }
  }, [supabase, showToast, refresh]);

  const today = new Date().toISOString().split("T")[0];

  const upcoming = useMemo(() => events.filter((e) => e.event_date >= today), [events, today]);
  const past = useMemo(() => events.filter((e) => e.event_date < today), [events, today]);

  const formatDate = useCallback((date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }), []);

  return (
    <div className="space-y-8">
      <Toast messages={toasts} onClose={closeToast} />
      <AdminPageHeader
        title="Gathering Assembly Scheduler"
        subtitle="Announce and manage upcoming and past family events."
      />

      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 bg-[#1b3622] text-[#fbf9f4] px-4 py-2.5 text-[11px] uppercase tracking-widest font-semibold hover:bg-[#d4af37] hover:text-[#1b3622] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Event
      </button>

      <div className="space-y-6">
        <EventSection
          title="Upcoming Events"
          events={upcoming}
          onEdit={setEditingEvent}
          onDelete={handleDelete}
          formatDate={formatDate}
          emptyText="No upcoming events scheduled."
        />
        <EventSection
          title="Past Events"
          events={past}
          onEdit={setEditingEvent}
          onDelete={handleDelete}
          formatDate={formatDate}
          emptyText="No past events recorded."
        />
      </div>

      {(isCreating || editingEvent) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1b3622]/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl border border-[#1b3622]/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-serif text-[#1b3622]">
                {isCreating ? "Add New Event" : "Edit Event"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setIsCreating(false);
                }}
                className="p-1 text-gray-400 hover:text-[#1b3622]"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <EventForm
              event={editingEvent}
              onSubmit={handleSave}
              onCancel={() => {
                setEditingEvent(null);
                setIsCreating(false);
              }}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EventSection({
  title,
  events,
  onEdit,
  onDelete,
  formatDate,
  emptyText,
}: {
  title: string;
  events: EventRow[];
  onEdit: (event: EventRow) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
  emptyText: string;
}) {
  return (
    <div className="bg-white border border-gray-100 p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-serif text-[#1b3622] flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#d4af37]" />
        {title}
      </h3>
      {events.length === 0 ? (
        <p className="text-xs text-gray-400 font-light italic">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-50 last:border-b-0 pb-3 last:pb-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#d4af37] font-semibold">
                    {formatDate(event.event_date)}
                  </span>
                  {event.location && (
                    <span className="text-[10px] text-gray-400">• {event.location}</span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-[#2d312e]">{event.title}</h4>
                {event.description && (
                  <p className="text-xs text-gray-500 font-light leading-relaxed max-w-2xl">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(event)}
                  className="p-1.5 text-[#1b3622] hover:bg-[#1b3622] hover:text-[#fbf9f4] transition-colors rounded-sm"
                  aria-label="Edit event"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                  aria-label="Delete event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
