"use client";

import React from "react";
import Image from "next/image";

interface EventPageImageProps {
  alt: string;
  isSupabaseImage: boolean;
  relativePathSrc: string;
}
/**
 * We need to make this a client componenent since we need the loader function
 * If we rendered this on the server as an RSC, then we would have to pass the loader fn to the client,
 * which is not permitted in the RSC Payload
 */
const EventPageImage = ({
  isSupabaseImage,
  relativePathSrc,
  alt,
}: EventPageImageProps) => {
  return (
    <Image
      src={relativePathSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      unoptimized={!isSupabaseImage} // Skip optimization for non-Supabase images
    />
  );
};

export default EventPageImage;
