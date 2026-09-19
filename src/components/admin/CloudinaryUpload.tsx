"use client";

import { useState, useEffect } from "react";
import { Upload, X, RefreshCw, ImageIcon } from "lucide-react";
import { CldUploadWidget, type CloudinaryUploadWidgetError } from "next-cloudinary";

interface CloudinaryUploadProps {
  existingUrl: string | null;
  onUploaded: (publicId: string, secureUrl: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  year?: string;
}

interface CloudinaryUploadInfo {
  public_id: string;
  secure_url: string;
}

interface CloudinaryUploadResult {
  event?: string;
  info?: CloudinaryUploadInfo;
}

export default function CloudinaryUpload({
  existingUrl,
  onUploaded,
  onError,
  disabled,
  year,
}: CloudinaryUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreview(existingUrl);
  }, [existingUrl]);

  const handleUpload = (result: unknown) => {
    const uploadResult = result as CloudinaryUploadResult;
    if (uploadResult.event === "success" && uploadResult.info) {
      onUploaded(uploadResult.info.public_id, uploadResult.info.secure_url);
      setPreview(uploadResult.info.secure_url);
      setIsUploading(false);
    } else if (uploadResult.event === "close") {
      setIsUploading(false);
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadError = (error: CloudinaryUploadWidgetError) => {
    setIsUploading(false);
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Cloudinary upload failed. The existing image was kept.";
    onError(message);
  };

  const handleRemove = () => {
    setPreview(null);
    onUploaded("", "");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <CldUploadWidget
          // Gallery uploads are signed by the authenticated server endpoint.
          // This avoids depending on a public unsigned upload preset, which can
          // cause the Cloudinary widget to fail to load when that preset is not
          // available for the cloud account.
          signatureEndpoint="/api/sign-cloudinary-params"
          options={{
            maxFiles: 1,
            maxFileSize: 5000000, // 5MB
            sources: ["local"],
            multiple: false,
            folder: year ? `gallery/${year}` : "gallery/historical",
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
          onSuccess={handleUpload}
          onError={handleUploadError}
          onOpen={handleUploadStart}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={disabled || isUploading}
              className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-gray-200 bg-[#fbf9f4] text-[#2d312e] hover:border-[#1b3622] transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : preview ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : preview ? "Replace image" : "Upload image"}
            </button>
          )}
        </CldUploadWidget>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-wider font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>

      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover border border-gray-200 rounded-sm"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-[#1b3622]/50 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-[#fbf9f4] animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-32 w-32 border border-dashed border-gray-200 bg-[#fbf9f4] flex flex-col items-center justify-center text-gray-400">
          <ImageIcon className="h-6 w-6 mb-1" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">No image</span>
        </div>
      )}
    </div>
  );
}
