"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, RefreshCw, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  bucket: string;
  folder?: string;
  existingUrl: string | null;
  onUploaded: (url: string | null) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  bucket,
  folder = "",
  existingUrl,
  onUploaded,
  onError,
  disabled,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(existingUrl);
  }, [existingUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError?.("Please select an image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(urlData.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      onError?.(message);
      setPreview(existingUrl);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploaded(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
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
