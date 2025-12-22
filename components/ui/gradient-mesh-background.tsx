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

    // Blob configuration
    const blobs = [
      { x: 0.3, y: 0.3, radius: 0.4, color: "rgba(139, 92, 246, 0.5)", speedX: 0.0003, speedY: 0.0002 }, // Purple
      { x: 0.7, y: 0.6, radius: 0.35, color: "rgba(59, 130, 246, 0.4)", speedX: -0.0002, speedY: 0.0003 }, // Blue
      { x: 0.5, y: 0.8, radius: 0.3, color: "rgba(236, 72, 153, 0.3)", speedX: 0.0002, speedY: -0.0002 }, // Pink
      { x: 0.2, y: 0.7, radius: 0.25, color: "rgba(16, 185, 129, 0.25)", speedX: 0.0003, speedY: 0.0001 }, // Teal
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

      // Clear with dark background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Draw each blob with animated position
      blobs.forEach((blob) => {
        const offsetX = Math.sin(time * blob.speedX * 1000 + blob.x * 10) * 0.1;
        const offsetY = Math.cos(time * blob.speedY * 1000 + blob.y * 10) * 0.1;

        drawBlob(
          blob.x + offsetX,
          blob.y + offsetY,
          blob.radius + Math.sin(time * 0.001) * 0.05,
          blob.color,
          width,
          height
        );
      });

      // Add noise/grain texture overlay
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
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
      style={{ filter: "blur(60px)" }}
    />
  );
}
