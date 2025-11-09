"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Moon, Sun, Info } from "lucide-react"
import { Toaster } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
              aria-label="Información de la aplicación"
            >
              <Info className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reclaim v1.0.0</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Análisis Financiero con IA - Importa tus datos de MercadoPago y descubre insights inteligentes sobre tus finanzas personales con pronósticos y recomendaciones basadas en IA.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium">Características principales:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Importación de datos desde MercadoPago</li>
                  <li>• Análisis financiero inteligente</li>
                  <li>• Pronósticos y recomendaciones con IA</li>
                  <li>• Visualización de datos en tiempo real</li>
                  <li>• Exportación de datos a CSV</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Cómo usar:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Ve a mercadopago.com.ar → Tu perfil → Privacidad</li>
                  <li>2. Solicita tu reporte de "Tus movimientos de dinero"</li>
                  <li>3. Descarga el archivo CSV o JSON</li>
                  <li>4. Arrástralo aquí para importar tus datos</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
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
