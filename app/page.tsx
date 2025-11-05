"use client"

import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { FileDropZone } from "@/components/file-drop-zone"
import { FloatingImportBar } from "@/components/floating-import-bar"
import { SummaryCards } from "@/components/summary-cards"
import { StepsChart } from "@/components/charts/steps-chart"
import { HeartRateChart } from "@/components/charts/heart-rate-chart"
import { SleepChart } from "@/components/charts/sleep-chart"
import { Footer } from "@/components/footer"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { healthStore } from "@/lib/health-store"
import type { HealthMetric } from "@/lib/health-data-parser"

export default function Home() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [displayMetrics, setDisplayMetrics] = useState<HealthMetric[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [metricsCount, setMetricsCount] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    // Initial load
    setMetrics(healthStore.getMetrics())

    // Subscribe to changes
    const unsubscribe = healthStore.subscribe(() => {
      setMetrics(healthStore.getMetrics())
      setMetricsCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    // Filter metrics by date range
    if (!startDate && !endDate) {
      setDisplayMetrics(metrics)
      return
    }

    const start = startDate ? new Date(startDate) : new Date(0)
    const end = endDate ? new Date(endDate) : new Date()
    setDisplayMetrics(healthStore.getMetricsInRange(start, end))
  }, [metrics, startDate, endDate])

  const handleClearData = () => {
    setShowConfirmDialog(true)
  }

  const confirmClearData = () => {
    healthStore.clearMetrics()
    setMetrics([])
    setDisplayMetrics([])
    setStartDate("")
    setEndDate("")
    toast.success("Datos borrados", {
      description: "Todos los datos de salud han sido eliminados"
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <img src="/logo.svg" alt="Reclaim" className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Reclaim</h1>
          </div>
          <p className="text-muted-foreground">Importa y visualiza tus datos de salud en tiempo real</p>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${metrics.length > 0 ? 'pb-40' : 'pb-32'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
        {metrics.length === 0 ? (
          <div className="space-y-6">
            <FileDropZone onFilesProcessed={(count) => setMetricsCount(count)} />
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Arrastra archivos JSON exportados desde Samsung Health para comenzar
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filters and Actions */}
            <div className="bg-card p-4 sm:p-6 border border-border space-y-4">
              {/* Date Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-muted transition-colors text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar filtros
                </button>
                <button
                  onClick={handleClearData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium"
                >
                  Borrar datos
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards metrics={displayMetrics} />

            {/* Charts Grid */}
            <div className="space-y-6">
              {/* Pasos */}
              <div className="bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">Pasos diarios</h2>
                <StepsChart metrics={displayMetrics} />
              </div>

              {/* Ritmo Cardíaco */}
              <div className="bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">Ritmo cardíaco</h2>
                <HeartRateChart metrics={displayMetrics} />
              </div>

              {/* Sueño */}
              <div className="bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">Duración del sueño</h2>
                <SleepChart metrics={displayMetrics} />
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Footer */}
      <Footer hasFloatingBar={metrics.length > 0} />

      {/* Floating Import Bar - Only show when there's data */}
      {metrics.length > 0 && (
        <FloatingImportBar onFilesProcessed={(count) => setMetricsCount((prev) => prev + count)} />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmClearData}
        title="¿Borrar todos los datos?"
        description="Esta acción eliminará permanentemente todos los datos de salud importados. No se puede deshacer."
        confirmText="Borrar datos"
        cancelText="Cancelar"
      />
    </div>
  )
}
