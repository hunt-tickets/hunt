"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"

interface AnimatedBackgroundProps {
  colors?: string[]
  distortion?: number
  swirl?: number
  speed?: number
  offsetX?: number
  veilOpacity?: string
}

export function AnimatedBackground({
  colors = ["#000000", "#1a1a1a", "#2d2d2d", "#1a1a1a", "#000000", "#0a0a0a"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  veilOpacity = "bg-black/40",
}: AnimatedBackgroundProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div className="fixed inset-0 w-screen h-screen">
      {mounted && (
        <>
          <MeshGradient
            width={dimensions.width}
            height={dimensions.height}
            colors={colors}
            distortion={distortion}
            swirl={swirl}
            grainMixer={0}
            grainOverlay={0}
            speed={speed}
            offsetX={offsetX}
          />
          <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
        </>
      )}
    </div>
  )
}
