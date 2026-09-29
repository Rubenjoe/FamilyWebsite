"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/utils/admin";

const PUBLIC_PATHS = new Set(["/", "/achievers", "/obituary", "/members", "/tree", "/gallery"]);

export async function revalidatePublicPaths(paths: string[]): Promise<boolean> {
  try {
    if (!Array.isArray(paths) || !paths.every((path) => typeof path === "string" && PUBLIC_PATHS.has(path))) {
      return false;
    }
    const session = await getAdminSession();
    if (!session?.canEditMembers) return false;

    for (const path of new Set(paths)) revalidatePath(path);
    return true;
  } catch (error: unknown) {
    console.error("[Revalidation] Could not refresh public routes:", error);
    return false;
  }
}
