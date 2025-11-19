"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400">
        <div className="h-4 w-4" />
        <span>Tema</span>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-between w-full gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Sun className="h-4 w-4 flex-shrink-0" />
        )}
        <span>Tema</span>
      </div>

      {/* Toggle Switch */}
      <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-white/10">
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            isDark ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}
