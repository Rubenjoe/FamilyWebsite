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
  try {
    // Verify admin authentication
    const session = await getAdminSession();
    if (!session || !session.canEditMembers) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { params_to_sign } = body;

    if (!params_to_sign || typeof params_to_sign !== "object") {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Generate Cloudinary signature
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      process.env.CLOUDINARY_API_SECRET!
    );

    // Return signature and safe public configuration
    return NextResponse.json({
      signature,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    });
  } catch (error) {
    console.error("[Cloudinary] Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
