"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Toaster } from "sonner"

function ThemeToggle({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const newDark = !isDark
    setIsDark(newDark)

    if (newDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) return <>{children}</>

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors z-50"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      {children}
    </>
  )
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <script suppressHydrationWarning>{`
        try {
          if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
          }
        } catch (e) {}
      `}</script>
      <ThemeToggle>{children}</ThemeToggle>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={5}
      />
    </ThemeProvider>
  )
}
