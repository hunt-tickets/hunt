"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"

type Language = "es" | "en"

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<Language>("es")
  const [isAnimating, setIsAnimating] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 px-3 rounded-full",
          "bg-zinc-950 border border-zinc-800",
          className
        )}
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  const handleLanguageChange = () => {
    setIsAnimating(true)
    const newLang: Language = language === "es" ? "en" : "es"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)

    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      className={cn(
        "flex items-center gap-2 h-10 px-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95",
        isDark
          ? "bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
          : "bg-zinc-100 border border-zinc-300 hover:bg-zinc-200",
        className
      )}
      onClick={handleLanguageChange}
      aria-label={`Switch to ${language === "es" ? "English" : "Spanish"}`}
    >
      <Globe
        className={cn(
          "w-4 h-4 transition-all duration-300",
          isAnimating && "rotate-180",
          isDark ? "text-zinc-400" : "text-zinc-600"
        )}
      />
      <span
        className={cn(
          "text-xs font-semibold transition-all duration-300",
          isAnimating && "scale-110",
          isDark ? "text-white" : "text-zinc-900"
        )}
      >
        {language.toUpperCase()}
      </span>
    </button>
  )
}
