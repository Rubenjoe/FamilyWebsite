import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryDestroyResponse {
  result?: string;
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  if (!publicId.trim()) {
    throw new Error("Cloudinary public ID is required.");
  }

  const response: unknown = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (typeof response !== "object" || response === null || !("result" in response)) {
    throw new Error("Cloudinary returned an invalid deletion response.");
  }

  const result = (response as CloudinaryDestroyResponse).result;
  if (result !== "ok" && result !== "not found") {
    throw new Error(`Cloudinary deletion failed with result "${result ?? "unknown"}".`);
  }
}
