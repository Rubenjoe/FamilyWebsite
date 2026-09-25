import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminSession } from "@/utils/admin";

// Configure Cloudinary with server-side credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const secret = process.env.CLOUDINARY_API_SECRET;

  try {
    // Verify admin authentication
    const session = await getAdminSession();
    if (!session || !session.canEditMembers) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const requiredEnvironmentVariables = [
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
      "NEXT_PUBLIC_CLOUDINARY_API_KEY",
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
      "CLOUDINARY_API_SECRET",
    ] as const;
    const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
      (name) => !process.env[name]
    );

    if (missingEnvironmentVariables.length > 0 || !secret) {
      console.error("[Cloudinary] Signature generation validation failed", {
        missingEnvironmentVariables,
      });
      return NextResponse.json(
        { error: "Cloudinary signing is not configured" },
        { status: 500 }
      );
    }

    const body: unknown = await request.json();
    const paramsToSign = isRecord(body) ? body.paramsToSign : undefined;

    console.info("[Cloudinary] Signature request received", {
      hasParamsToSign: paramsToSign !== undefined,
    });

    if (!isRecord(paramsToSign)) {
      console.error("[Cloudinary] Signature validation failed", {
        hasParamsToSign: paramsToSign !== undefined,
        reason: "paramsToSign must be a non-null object",
      });
      return NextResponse.json(
        { error: "Invalid signing parameters" },
        { status: 400 }
      );
    }

    try {
      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        secret
      );

      return NextResponse.json({ signature });
    } catch (error) {
      const details = getCloudinaryErrorDetails(error, secret);
      console.error("[Cloudinary] Signature generation failed", details);
      return NextResponse.json(
        { error: "Failed to generate Cloudinary signature" },
        { status: 500 }
      );
    }
  } catch (error) {
    const details = getCloudinaryErrorDetails(error, secret);
    console.error("[Cloudinary] Signature request failed", details);
    return NextResponse.json(
      { error: "Failed to process Cloudinary signature request" },
      { status: 500 }
    );
  }
}

function getCloudinaryErrorDetails(error: unknown, secret: string | undefined) {
  const redactSecret = (value: unknown) => {
    if (typeof value !== "string") return value;
    return secret ? value.replaceAll(secret, "[REDACTED]") : value;
  };

  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactSecret(error.message),
      code: "code" in error ? redactSecret(error.code) : undefined,
    };
  }

  return { details: redactSecret(error) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
