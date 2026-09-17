import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/utils/admin";
import { createClient } from "@/utils/supabase/server";
import { deleteCloudinaryImage } from "@/utils/cloudinary-server";
import type { Database } from "@/types/supabase";

type GalleryInsert = Database["public"]["Tables"]["gallery_records"]["Insert"];
type GalleryUpdate = Database["public"]["Tables"]["gallery_records"]["Update"];

interface GalleryMutationBody {
  id?: string;
  title: string;
  album: string | null;
  branch: string | null;
  year_label: string | null;
  description: string | null;
  image_path: string;
  cloudinary_public_id: string | null;
  cloudinary_secure_url: string | null;
  is_published: boolean;
  sort_order: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBody(value: unknown): GalleryMutationBody | null {
  if (!isObject(value)) return null;
  if (
    typeof value.title !== "string" ||
    (value.id !== undefined && typeof value.id !== "string") ||
    (value.album !== null && typeof value.album !== "string") ||
    (value.branch !== null && typeof value.branch !== "string") ||
    (value.year_label !== null && typeof value.year_label !== "string") ||
    (value.description !== null && typeof value.description !== "string") ||
    typeof value.image_path !== "string" ||
    (value.cloudinary_public_id !== null &&
      typeof value.cloudinary_public_id !== "string") ||
    (value.cloudinary_secure_url !== null &&
      typeof value.cloudinary_secure_url !== "string") ||
    typeof value.is_published !== "boolean" ||
    typeof value.sort_order !== "number"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    album: value.album,
    branch: value.branch,
    year_label: value.year_label,
    description: value.description,
    image_path: value.image_path,
    cloudinary_public_id: value.cloudinary_public_id,
    cloudinary_secure_url: value.cloudinary_secure_url,
    is_published: value.is_published,
    sort_order: value.sort_order,
  };
}

async function requireGalleryEditor(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (!session || !session.canEditMembers) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireGalleryEditor();
  if (unauthorized) return unauthorized;

  const body = parseBody(await request.json());
  if (!body || !body.cloudinary_public_id) {
    return NextResponse.json(
      { error: "A Cloudinary image is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const payload: GalleryInsert = {
    title: body.title,
    album: body.album,
    branch: body.branch,
    year_label: body.year_label,
    description: body.description,
    image_path: body.image_path,
    cloudinary_public_id: body.cloudinary_public_id,
    cloudinary_secure_url: body.cloudinary_secure_url,
    is_published: body.is_published,
    sort_order: body.sort_order,
  };

  if (!body.id) {
    const { error } = await supabase.from("gallery_records").insert(payload);
    if (error) {
      try {
        await deleteCloudinaryImage(body.cloudinary_public_id);
      } catch (cleanupError) {
        console.error(
          "[Admin Gallery] Failed to clean up uploaded image after insert failure:",
          cleanupError
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Gallery photo created." });
  }

  const { data: existing, error: readError } = await supabase
    .from("gallery_records")
    .select("id, cloudinary_public_id")
    .eq("id", body.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Gallery record not found." }, { status: 404 });
  }

  const oldPublicId = existing.cloudinary_public_id;
  const update: GalleryUpdate = payload;
  const { error: updateError } = await supabase
    .from("gallery_records")
    .update(update)
    .eq("id", body.id);

  if (updateError) {
    if (body.cloudinary_public_id !== oldPublicId) {
      try {
        await deleteCloudinaryImage(body.cloudinary_public_id);
      } catch (cleanupError) {
        console.error(
          "[Admin Gallery] Failed to clean up replacement image after update failure:",
          cleanupError
        );
      }
    }
    return NextResponse.json(
      { error: `Gallery update failed: ${updateError.message}` },
      { status: 500 }
    );
  }

  if (oldPublicId && oldPublicId !== body.cloudinary_public_id) {
    const { data: references, error: referenceError } = await supabase
      .from("gallery_records")
      .select("id")
      .eq("cloudinary_public_id", oldPublicId)
      .neq("id", body.id);

    if (referenceError) {
      console.error("[Admin Gallery] Could not verify old image references:", referenceError);
      return NextResponse.json({
        message: "Gallery photo updated.",
        warning:
          "Gallery photo updated, but the old Cloudinary image could not be checked for shared references.",
      });
    }

    if (!references || references.length === 0) {
      try {
        await deleteCloudinaryImage(oldPublicId);
      } catch (cleanupError) {
        console.error("[Admin Gallery] Failed to delete replaced Cloudinary image:", cleanupError);
        return NextResponse.json({
          message: "Gallery photo updated.",
          warning:
            "Gallery photo updated, but the old Cloudinary image could not be removed.",
        });
      }
    }
  }

  return NextResponse.json({ message: "Gallery photo updated." });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireGalleryEditor();
  if (unauthorized) return unauthorized;

  const body: unknown = await request.json();
  if (!isObject(body) || typeof body.id !== "string" || !body.id) {
    return NextResponse.json(
      { error: "Gallery record ID is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: record, error: readError } = await supabase
    .from("gallery_records")
    .select("id, cloudinary_public_id")
    .eq("id", body.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (!record) {
    return NextResponse.json({ error: "Gallery record not found." }, { status: 404 });
  }

  const publicId = record.cloudinary_public_id;
  if (publicId) {
    const { error: referenceError } = await supabase
      .from("gallery_records")
      .select("id")
      .eq("cloudinary_public_id", publicId)
      .neq("id", body.id);

    if (referenceError) {
      return NextResponse.json(
        { error: `Could not verify shared image references: ${referenceError.message}` },
        { status: 500 }
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("gallery_records")
    .delete()
    .eq("id", body.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (!publicId) {
    return NextResponse.json({ message: "Gallery photo deleted." });
  }

  const { data: remainingReferences, error: remainingError } = await supabase
    .from("gallery_records")
    .select("id")
    .eq("cloudinary_public_id", publicId);

  if (remainingError) {
    console.error(
      "[Admin Gallery] Could not verify Cloudinary image ownership after delete:",
      remainingError
    );
    return NextResponse.json({
      message: "Gallery record deleted.",
      warning:
        "Gallery record deleted, but the Cloudinary image could not be checked for remaining references.",
    });
  }

  if ((remainingReferences?.length ?? 0) === 0) {
    try {
      await deleteCloudinaryImage(publicId);
    } catch (cleanupError) {
      console.error(
        "[Admin Gallery] Failed to delete Cloudinary image after record deletion:",
        cleanupError
      );
      return NextResponse.json({
        message: "Gallery record deleted.",
        warning:
          "Gallery record deleted, but the Cloudinary image could not be removed.",
      });
    }
  }

  return NextResponse.json({ message: "Gallery photo deleted." });
}
