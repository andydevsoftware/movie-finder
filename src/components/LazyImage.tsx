"use client";

import { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export default function LazyImage({
  src,
  alt,
  className = "",
  aspectRatio = "2/3",
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#1a1a1a] ${className}`}
      style={{ aspectRatio }}
    >
      {/* Dark placeholder (NO shimmer, NO blanco) */}
      {!loaded && !error && <div className="absolute inset-0 bg-[#1a1a1a]" />}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-xs text-gray-500">Sin imagen</span>
        </div>
      )}

      {/* Image (CSS fade only) */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
