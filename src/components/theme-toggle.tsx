"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative h-9 w-9 rounded-md border border-border bg-card hover:bg-accent transition-colors"
        aria-label="Theme toggle"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Sun className="h-4 w-4" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 rounded-md border border-border bg-card hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-foreground" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )}
      </div>
    </button>
  )
}
