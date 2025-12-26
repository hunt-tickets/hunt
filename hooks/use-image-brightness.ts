import { useEffect, useState } from 'react';

interface UseImageBrightnessOptions {
  /**
   * Percentage of the image height to analyze from the bottom
   * Default: 0.3 (30% from bottom)
   */
  sampleHeight?: number;
  /**
   * Brightness threshold (0-255)
   * Values above this are considered "light"
   * Default: 127 (middle point)
   */
  threshold?: number;
}

/**
 * Hook to analyze image brightness and determine if text should be dark or light
 * @param imageUrl - URL of the image to analyze
 * @param options - Configuration options
 * @returns isDark - true if text should be dark (image is light), false if text should be light (image is dark)
 */
export function useImageBrightness(
  imageUrl: string | null | undefined,
  options: UseImageBrightnessOptions = {}
) {
  const { sampleHeight = 0.3, threshold = 127 } = options;
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    // Skip analysis for known placeholder image - it's dark, so use light text
    if (imageUrl === '/event-placeholder.svg' || imageUrl.endsWith('/event-placeholder.svg')) {
      setIsDark(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Allow cross-origin images

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsLoading(false);
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Calculate the area to sample (bottom portion)
        const sampleHeightPx = Math.floor(img.height * sampleHeight);
        const startY = img.height - sampleHeightPx;

        // Get image data from the bottom portion
        const imageData = ctx.getImageData(0, startY, img.width, sampleHeightPx);
        const data = imageData.data;

        // Calculate average brightness
        let totalBrightness = 0;
        let pixelCount = 0;

        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Calculate perceived brightness (weighted formula)
          // Human eye is more sensitive to green
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
          totalBrightness += brightness;
          pixelCount++;
        }

        const averageBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;

        // If image is bright, use dark text; if dark, use light text
        setIsDark(averageBrightness > threshold);
        setIsLoading(false);
      } catch (error) {
        console.error('Error analyzing image brightness:', error);
        setIsDark(false); // Default to light text on error
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      // Silently fail - this is expected for placeholder images or CORS-restricted URLs
      setIsDark(false); // Default to light text on error
      setIsLoading(false);
    };

    img.src = imageUrl;
  }, [imageUrl, sampleHeight, threshold]);

  return { isDark, isLoading };
}
