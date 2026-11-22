"use client";

import { useEffect, useRef, useState } from "react";

type FadeImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Photograph that settles in rather than popping. Archive imagery arrives at
 * unpredictable sizes, so a soft opacity fade keeps the editorial surfaces calm
 * while `loading="lazy"` still governs when the request starts.
 *
 * `complete` is checked on mount because cached images can finish before
 * hydration attaches `onLoad` — without it they would stay invisible.
 */
export default function FadeImage({
  src,
  alt,
  className = "",
  priority = false,
}: FadeImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (ref.current?.complete) setIsLoaded(true);
  }, [src]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      className={`${className} transition-[opacity,transform] duration-700 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
