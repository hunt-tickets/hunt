"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { MorphingText } from "@/components/ui/morphing-text"

// H → U → N → T morphing sequence (only once)
const HUNT_LETTERS = ["H", "U", "N", "T"]

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    // Check if this is the first visit or if we should show the loader
    const hasVisited = sessionStorage.getItem("hasVisited")

    if (hasVisited) {
      // If already visited in this session, don't show loader
      setIsLoading(false)
      return
    }

    // Fast morphing animation: 0.7s per transition, 0.25s cooldown
    // Total: (0.7s + 0.25s) × 3 transitions = 2.85s for H→U→N→T
    const totalDuration = 3500 // 3.5 seconds total - optimized loading experience

    // Start exit animation
    const timer = setTimeout(() => {
      setIsAnimatingOut(true)
      // Mark as visited
      sessionStorage.setItem("hasVisited", "true")

      // Remove loader after animation completes
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }, totalDuration)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-800",
        isAnimatingOut && "opacity-0"
      )}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

      {/* Morphing HUNT Letters */}
      <div className="relative z-10 flex items-center justify-center px-6 w-full">
        <MorphingText
          texts={HUNT_LETTERS}
          className="!h-32 md:!h-48 lg:!h-64"
          style={{ fontFamily: "LOT, sans-serif" }}
        />
      </div>
    </div>
  )
}
