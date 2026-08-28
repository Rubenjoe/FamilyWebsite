import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import EventManager from "@/components/admin/EventManager";
import type { Database } from "@/types/supabase";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export default async function AdminEventsPage() {
  const session = await getAdminSession();
  if (!session || !session.canEditEvents) {
    redirect("/dashboard?error=unauthorized");
  }

  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,description,event_date,location,created_at,created_by")
    .order("event_date", { ascending: true })
    .returns<EventRow[]>();

  if (error) {
    console.error("Error loading events:", error);
  }

  return <EventManager initialEvents={events || []} />;
}
