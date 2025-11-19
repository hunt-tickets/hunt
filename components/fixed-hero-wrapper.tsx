"use client"

import { useEffect, useRef } from "react"

interface FixedHeroWrapperProps {
  children: React.ReactNode
}

export function FixedHeroWrapper({ children }: FixedHeroWrapperProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Capture viewport height ONCE on mount and NEVER update it
    // This prevents the hero from jumping when browser UI appears/disappears
    const captureHeight = () => {
      if (typeof window === 'undefined') return

      // Use window.innerHeight which gives us the actual viewport
      const vh = window.innerHeight

      // Apply the fixed height to both elements
      if (heroRef.current) {
        heroRef.current.style.height = `${vh}px`
      }
      if (spacerRef.current) {
        spacerRef.current.style.height = `${vh}px`
      }

      // Also set CSS custom property for any other uses
      document.documentElement.style.setProperty('--app-height', `${vh}px`)
    }

    // Small delay to ensure window is fully loaded
    const timeoutId = setTimeout(captureHeight, 50)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
    }
  }, []) // Empty dependency array - only run once on mount

  return (
    <>
      {/* Fixed Hero Background */}
      <div
        ref={heroRef}
        className="fixed top-0 left-0 right-0 w-full z-0"
        style={{
          // Use CSS with fallback chain for maximum compatibility
          // svh = small viewport height (most stable on mobile)
          height: '100svh',
          // Fallback for older browsers
          minHeight: '100vh',
        }}
      >
        {children}
      </div>

      {/* Spacer */}
      <div
        ref={spacerRef}
        style={{
          height: '100svh',
          minHeight: '100vh',
        }}
      />
    </>
  )
}
