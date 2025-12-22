"use client";

import { useEffect, useRef } from "react";

interface GradientMeshBackgroundProps {
  className?: string;
}

export function GradientMeshBackground({ className = "" }: GradientMeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Blob configuration - pure gray tones
    const blobs = [
      { x: 0.3, y: 0.3, radius: 0.5, color: "rgba(90, 90, 90, 0.4)", speedX: 0.0002, speedY: 0.00015 },
      { x: 0.7, y: 0.6, radius: 0.45, color: "rgba(70, 70, 70, 0.35)", speedX: -0.00015, speedY: 0.0002 },
      { x: 0.5, y: 0.8, radius: 0.4, color: "rgba(80, 80, 80, 0.3)", speedX: 0.00015, speedY: -0.00015 },
      { x: 0.2, y: 0.7, radius: 0.35, color: "rgba(60, 60, 60, 0.25)", speedX: 0.0002, speedY: 0.0001 },
    ];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const drawBlob = (
      x: number,
      y: number,
      radius: number,
      color: string,
      width: number,
      height: number
    ) => {
      const gradient = ctx.createRadialGradient(
        x * width,
        y * height,
        0,
        x * width,
        y * height,
        radius * Math.min(width, height)
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear with very dark background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Draw each blob with animated position
      blobs.forEach((blob) => {
        const offsetX = Math.sin(time * blob.speedX * 1000 + blob.x * 10) * 0.08;
        const offsetY = Math.cos(time * blob.speedY * 1000 + blob.y * 10) * 0.08;

        drawBlob(
          blob.x + offsetX,
          blob.y + offsetY,
          blob.radius + Math.sin(time * 0.0008) * 0.03,
          blob.color,
          width,
          height
        );
      });

      // Add subtle noise/grain texture overlay
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);

      time++;
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ filter: "blur(80px)" }}
    />
  );
}
