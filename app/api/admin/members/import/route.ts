import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/utils/admin";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseCsvRecords } from "@/utils/csv";
import type { Database } from "@/types/supabase";

type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];

const MAX_ROWS = 5000;
const BATCH_SIZE = 200;
const REQUIRED_COLUMN = "name";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Member registry import.
 *
 * Accepts the exact CSV that `/api/admin/members/export` produces, so an export
 * can be edited in a spreadsheet and re-imported without surprises. Rows are
 * matched on name + birth date; an exact match already in the database (or
 * earlier in the same file) is skipped rather than duplicated, which makes
 * re-running an import harmless.
 */

function trimmed(value: string | undefined): string {
  return (value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { csv?: unknown }).csv !== "string"
  ) {
    return NextResponse.json({ error: "A csv string is required." }, { status: 400 });
  }

  const csv = (payload as { csv: string }).csv;
  const { header, records } = parseCsvRecords(csv);

  if (records.length === 0) {
    return NextResponse.json(
      { error: "That file has a header but no rows." },
      { status: 400 }
    );
  }

  if (!header.includes(REQUIRED_COLUMN)) {
    return NextResponse.json(
      {
        error: `The file needs a "name" column. Columns found: ${header.join(", ") || "none"}.`,
      },
      { status: 400 }
    );
  }

  if (records.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (${records.length}). Import at most ${MAX_ROWS} at a time.` },
      { status: 413 }
    );
  }

  const supabase = await createClient();

  // Existing registry, for de-duplication. 700-odd rows — cheap enough.
  const { data: existing, error: existingError } = await supabase
    .from("members")
    .select("id,name,birth_date")
    .returns<Array<{ id: string; name: string | null; birth_date: string | null }>>();

  if (existingError) {
    console.error("[Members import] Could not read existing members:", existingError);
    return NextResponse.json(
      { error: `Could not read the current registry: ${existingError.message}` },
      { status: 500 }
    );
  }

  const seen = new Set<string>();
  for (const member of existing ?? []) {
    seen.add(
      `${(member.name ?? "").trim().toLowerCase()}|${(member.birth_date ?? "").trim()}`
    );
  }

  const toInsert: MemberInsert[] = [];
  const errors: string[] = [];
  let skipped = 0;
  let invalid = 0;

  records.forEach((record, index) => {
    const lineNumber = index + 2; // header is line 1

    const name = trimmed(record.name);
    if (!name) {
      invalid += 1;
      if (errors.length < 20) errors.push(`Line ${lineNumber}: missing name.`);
      return;
    }

    const birthDate = trimmed(record.birth_date) || null;
    if (birthDate && !ISO_DATE.test(birthDate)) {
      invalid += 1;
      if (errors.length < 20) {
        errors.push(`Line ${lineNumber}: birth_date "${birthDate}" is not YYYY-MM-DD.`);
      }
      return;
    }

    const deathDate = trimmed(record.death_date) || null;
    if (deathDate && !ISO_DATE.test(deathDate)) {
      invalid += 1;
      if (errors.length < 20) {
        errors.push(`Line ${lineNumber}: death_date "${deathDate}" is not YYYY-MM-DD.`);
      }
      return;
    }

    const key = `${name.toLowerCase()}|${birthDate ?? ""}`;
    if (seen.has(key)) {
      skipped += 1;
      return;
    }
    seen.add(key);

    // Relationship ids only make sense when they refer to rows in this
    // database; a malformed id is dropped and reported rather than failing the
    // whole import.
    const relation = (field: string) => {
      const value = trimmed(record[field]);
      if (!value) return null;
      if (!UUID.test(value)) {
        if (errors.length < 20) {
          errors.push(`Line ${lineNumber}: ${field} "${value}" is not a valid id, cleared.`);
        }
        return null;
      }
      return value;
    };

    toInsert.push({
      name,
      birth_date: birthDate,
      death_date: deathDate,
      bio: trimmed(record.bio) || null,
      father_id: relation("father_id"),
      mother_id: relation("mother_id"),
      spouse_id: relation("spouse_id"),
      photo_url: trimmed(record.photo_url) || null,
    });
  });

  // The permission check above already authorised this caller. The bulk write
  // itself prefers the service-role client, which bypasses RLS, so an import
  // works even on a database whose members write policies are missing; without
  // the key it falls back to the caller's own session and RLS applies.
  const writer = createAdminClient() ?? supabase;

  let inserted = 0;
  for (let start = 0; start < toInsert.length; start += BATCH_SIZE) {
    const chunk = toInsert.slice(start, start + BATCH_SIZE);
    const { error } = await writer.from("members").insert(chunk);
    if (error) {
      console.error("[Members import] Insert failed:", error);
      const blocked = /row-level security/i.test(error.message);
      return NextResponse.json(
        {
          error: blocked
            ? `Import stopped after ${inserted} rows: the database rejected the insert ` +
              "(row-level security). Apply supabase/migrations/20261122_members_admin_write_policies.sql, " +
              "or set SUPABASE_SERVICE_ROLE_KEY so imports can write with the service role."
            : `Import stopped after ${inserted} rows: ${error.message}`,
          inserted,
          skipped,
          invalid,
          errors,
        },
        { status: blocked ? 403 : 500 }
      );
    }
    inserted += chunk.length;
  }

  if (inserted > 0) {
    revalidatePath("/tree");
    revalidatePath("/members");
  }

  return NextResponse.json({
    inserted,
    skipped,
    invalid,
    total: records.length,
    errors,
  });
}
