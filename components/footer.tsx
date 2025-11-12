"use client"

import { useState, useEffect } from "react"
import { Bug } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useModalScrollLock } from "@/hooks/useModalScrollLock"

interface FooterProps {
  hasFloatingBar?: boolean
}

export function Footer({ hasFloatingBar = false }: FooterProps) {
  const [isBugReportOpen, setIsBugReportOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Bloquear scroll del body cuando el modal está abierto
  useModalScrollLock(isBugReportOpen)

  const handleBugReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subject = encodeURIComponent(`Bug Report: ${bugReport.title}`)
    const body = encodeURIComponent(`
BUG REPORT - Reclaim v2.0.0
${'='.repeat(50)}

INFORMACIÓN DEL SISTEMA:
- Sistema operativo: ${navigator.platform}
- Navegador: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

DESCRIPCIÓN DEL BUG:
${bugReport.description}

PASOS PARA REPRODUCIR:
${bugReport.steps}

COMPORTAMIENTO ESPERADO:
${bugReport.expected}

COMPORTAMIENTO ACTUAL:
${bugReport.actual}

REPORTADO POR: Usuario de Reclaim
    `)

    window.open(`mailto:soporte@reclaim.com?subject=${subject}&body=${body}`)

    // Reset form
    setBugReport({
      title: '',
      description: '',
      steps: '',
      expected: '',
      actual: ''
    })
    setIsBugReportOpen(false)

    toast.success('Reporte enviado', {
      description: 'Tu reporte de bug ha sido enviado al equipo de soporte'
    })
  }

  if (hasFloatingBar) {
    // Desktop: footer on the right side
    // Mobile: footer below the floating bar
    return (
      <>
        {/* Desktop version - right side */}
        <div className="hidden sm:block fixed bottom-4 right-4 z-50">
          <div className="bg-card border border-border px-3 py-2 shadow-sm flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Reclaim v2.0.0</span>
            {mounted && (
              <Dialog open={isBugReportOpen} onOpenChange={setIsBugReportOpen}>
                <DialogTrigger asChild>
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Reportar un bug"
                    onClick={() => console.log('Bug button clicked')}
                  >
                    <Bug className="w-4 h-4" />
                  </button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reportar un Bug</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBugReportSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="bug-title" className="mb-2 block">Título del bug *</Label>
                  <Input
                    id="bug-title"
                    value={bugReport.title}
                    onChange={(e) => setBugReport(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Breve descripción del problema"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bug-description" className="mb-2 block">Descripción del bug *</Label>
                  <Textarea
                    id="bug-description"
                    value={bugReport.description}
                    onChange={(e) => setBugReport(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe detalladamente qué problema encontraste"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bug-steps" className="mb-2 block">Pasos para reproducir</Label>
                  <Textarea
                    id="bug-steps"
                    value={bugReport.steps}
                    onChange={(e) => setBugReport(prev => ({ ...prev, steps: e.target.value }))}
                    placeholder="1. Ve a...
2. Haz clic en...
3. El error ocurre cuando..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="bug-expected" className="mb-2 block">Comportamiento esperado</Label>
                  <Textarea
                    id="bug-expected"
                    value={bugReport.expected}
                    onChange={(e) => setBugReport(prev => ({ ...prev, expected: e.target.value }))}
                    placeholder="Qué debería suceder normalmente"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="bug-actual" className="mb-2 block">Comportamiento actual</Label>
                  <Textarea
                    id="bug-actual"
                    value={bugReport.actual}
                    onChange={(e) => setBugReport(prev => ({ ...prev, actual: e.target.value }))}
                    placeholder="Qué está sucediendo realmente"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBugReportOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Enviar Reporte
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>


    </>
    )
  }

  // Normal footer when no floating bar
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <span>Reclaim v2.0.0</span>
        </div>
      </div>
    </footer>
  )
}