"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type LightboxImageProps = {
  src: string;
  /** Optional higher-resolution source used inside the lightbox (e.g. the un-resized Cloudinary URL). */
  fullSrc?: string;
  alt: string;
  className?: string;
  buttonClassName?: string;
  /** Set when the image is the page's primary content and should load eagerly. */
  priority?: boolean;
};

export default function LightboxImage({
  src,
  fullSrc,
  alt,
  className = "",
  buttonClassName = "h-full w-full",
  priority = false,
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const largeSrc = fullSrc || src;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return <>
    <button type="button" onClick={() => setIsOpen(true)} className={`block cursor-zoom-in ${buttonClassName}`} aria-label={`View larger photo of ${alt}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    </button>
    {isOpen && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Full size photo of ${alt}`}
        className="lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#102517]/90 backdrop-blur-sm select-none"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="lightbox-content relative max-h-[88dvh] max-w-[95vw] sm:max-w-5xl flex items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            src={largeSrc}
            alt={alt}
            className="max-h-[82dvh] sm:max-h-[85vh] max-w-full w-auto h-auto object-contain shadow-2xl rounded-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="fixed sm:absolute top-3 right-3 sm:-top-3 sm:-right-3 z-[101] grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b3622] shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#d4af37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] cursor-pointer"
            aria-label="Close photo viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    )}
  </>;
}
