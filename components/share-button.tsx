"use client";

import { Copy, Check } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import { Button } from "./ui/button";

interface ShareButtonProps {
  variant?: "card" | "button";
}

export function ShareButton({ variant = "card" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);

      // Reset the check icon back to copy after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  // Render as a simple button
  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        className="transition-all"
      >
        {copied ? (
          <Check className="h-4 w-4 transition-all" />
        ) : (
          <Copy className="h-4 w-4 transition-all" />
        )}
      </Button>
    );
  }

  // Render as a card

  return (
    <Card
      onClick={handleShare}
      className="h-full transition-all duration-500 hover:shadow-md cursor-pointer border-2 hover:border-primary/30"
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            {copied ? (
              <Check className="h-6 w-6 transition-all" />
            ) : (
              <Copy className="h-6 w-6 transition-all" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Compartir</CardTitle>
            <CardDescription className="mt-1.5">
              Comparte la plataforma con tus amigos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
