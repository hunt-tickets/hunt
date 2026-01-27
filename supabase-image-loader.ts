// // Docs: https://supabase.com/docs/guides/storage/image-transformations#nextjs-loader

export function extractSupabasePath(url: string) {
  // Check for the existence or location of substrings (url)
  const marker = "/storage/v1/object/public/";
  const index = url.indexOf(marker);

  if (index === -1) {
    // Not a Supabase public URL → return as-is
    return url;
  }

  return url.slice(index + marker.length);
}

// supabase-image-loader.ts
import type { ImageLoader } from "next/image";

const baseUrl = "https://db.hunt-tickets.com"; // or your supabase domain

const supabaseLoader: ImageLoader = ({ src, width, quality }) => {
  const url = `${baseUrl}/storage/v1/render/image/public/${src}?width=${width}&quality=${quality || 75}`;
  console.log('[Supabase Loader] Called with:', { src, width, quality, outputUrl: url });
  return url;
};

export default supabaseLoader;

/**
 * 
 You are telling Next.js:

Do NOT use the built-in optimizer

For every <Image />:

Call supabaseLoader({ src, width, quality })

Whatever URL it returns is what the browser loads

So:

<Image src="https://images.unsplash.com/..." />
→ Next will pass that full URL into supabaseLoader
→ Your loader will generate a broken Supabase URL

This is why the docs’ setup is dangerous if you also use other image source

 */
