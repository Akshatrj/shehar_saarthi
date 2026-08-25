"use client";

import { useState } from "react";

type ComplaintPhotoProps = {
  src: string;
  alt?: string;
};

export function ComplaintPhoto({
  src,
  alt = "Complaint photograph",
}: ComplaintPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center bg-paper px-4 text-center text-small text-muted"
        role="img"
        aria-label="Photo unavailable"
      >
        Photo unavailable
      </div>
    );
  }

  return (
    // Native img skips the Next.js optimizer so a 404 blob URL cannot trigger libvips.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-[4/3] w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
