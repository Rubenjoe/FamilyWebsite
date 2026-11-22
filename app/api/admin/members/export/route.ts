import { NextResponse } from "next/server";
import { getAdminSession } from "@/utils/admin";
import { createClient } from "@/utils/supabase/server";
import { toCsv } from "@/utils/csv";
import type { Database } from "@/types/supabase";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];

/** Column order doubles as the import contract — see the import route. */
const COLUMNS = [
  "id",
  "name",
  "birth_date",
  "death_date",
  "bio",
  "father_id",
  "mother_id",
  "spouse_id",
  "photo_url",
] as const;

export async function GET() {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select(COLUMNS.join(","))
    .order("name", { ascending: true })
    .returns<MemberRow[]>();

  if (error) {
    console.error("[Members export] Query failed:", error);
    return NextResponse.json(
      { error: `Could not read the member registry: ${error.message}` },
      { status: 500 }
    );
  }

  const csv = toCsv(data ?? [], [...COLUMNS]);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pulazhiyil-members-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
