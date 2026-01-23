"use client";

import React from "react";
import supabaseLoader from "@/supabase-image-loader";
import Image from "next/image";

interface EventPageImageProps {
  alt: string;
  isSupabaseImage: boolean;
  relativePathSrc: string;
}

const EventPageImage = ({
  isSupabaseImage,
  relativePathSrc,
  alt,
}: EventPageImageProps) => {
  return (
    <Image
      loader={isSupabaseImage ? supabaseLoader : undefined}
      src={relativePathSrc}
      alt={alt || "Evento"}
      fill
      priority
      sizes="100vw"
      className="object-cover object-top"
    />
  );
};

export default EventPageImage;
