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
        className="lightbox-overlay fixed inset-0 z-[100] grid place-items-center bg-[#102517]/90 p-5 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <div className="lightbox-content relative max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
          <img src={largeSrc} alt={alt} className="max-h-[85vh] max-w-full object-contain shadow-2xl" />
          <button type="button" onClick={() => setIsOpen(false)} className="absolute -right-2 -top-2 grid h-11 w-11 place-items-center rounded-full bg-white text-[#1b3622] shadow-lg transition-transform duration-200 hover:scale-105" aria-label="Close photo viewer"><X className="h-5 w-5" /></button>
        </div>
      </div>
    )}
  </>;
}
