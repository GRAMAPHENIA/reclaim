"use client"

import { useEffect, useState } from "react"
import { RotateCcw, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { FinancialDropZone } from "@/components/financial-drop-zone"
import { FinancialCards } from "@/components/financial-cards"
import { FinancialChart } from "@/components/financial-chart"
import { FinancialInsights } from "@/components/financial-insights"
import { FloatingImportBar } from "@/components/floating-import-bar"
import { Footer } from "@/components/footer"
import { financialStore } from "@/lib/financial-store"
import { generateFinancialForecast } from "@/lib/financial-analytics"
import type { FinancialTransaction } from "@/lib/financial-data-parser"
import type { FinancialInsights as FinancialInsightsType } from "@/lib/financial-analytics"

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [displayTransactions, setDisplayTransactions] = useState<FinancialTransaction[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [transactionsCount, setTransactionsCount] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [insights, setInsights] = useState<FinancialInsightsType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 50

  useEffect(() => {
    // Initial load
    setTransactions(financialStore.getTransactions())

    // Subscribe to changes
    const unsubscribe = financialStore.subscribe(() => {
      setTransactions(financialStore.getTransactions())
      setTransactionsCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [])

  // Calcular insights cuando cambian las transacciones
  useEffect(() => {
    if (transactions.length > 0) {
      const newInsights = generateFinancialForecast(transactions)
      setInsights(newInsights)
    } else {
      setInsights(null)
    }
  }, [transactions])

  useEffect(() => {
    // Filter transactions by date range and category
    let filtered = transactions

    if (startDate) {
      const start = new Date(startDate)
      filtered = filtered.filter((t) => t.date >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Include the entire end date
      filtered = filtered.filter((t) => t.date <= end)
    }

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    setDisplayTransactions(filtered)
  }, [transactions, startDate, endDate, selectedCategory])

  const handleClearData = () => {
    setShowConfirmDialog(true)
  }

  const confirmClearData = () => {
    financialStore.clearFinancialData()
    setTransactions([])
    setDisplayTransactions([])
    setStartDate("")
    setEndDate("")
    setSelectedCategory("")
    toast.success("Datos borrados", {
      description: "Todos los datos financieros han sido eliminados"
    })
  }

  const exportData = () => {
    if (!displayTransactions.length) {
      toast.error("No hay datos para exportar")
      return
    }

    const csvContent = [
      ["Fecha", "Descripción", "Monto", "Tipo", "Categoría", "Método de Pago", "Estado", "Referencia"],
      ...displayTransactions.map(t => [
        t.date.toISOString().split('T')[0],
        t.description,
        t.amount.toString(),
        t.type,
        t.category,
        t.paymentMethod,
        t.status,
        t.reference
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reclaim-finanzas-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Datos exportados", {
      description: "Archivo CSV descargado exitosamente"
    })
  }

  // Calcular paginación
  const totalPages = Math.ceil(displayTransactions.length / transactionsPerPage)
  const startIndex = (currentPage - 1) * transactionsPerPage
  const endIndex = startIndex + transactionsPerPage
  const currentTransactions = displayTransactions.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(transactions.map(t => t.category))).sort()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <img src="/logo.svg" alt="Reclaim Logo" className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Reclaim</h1>
          </div>
          <p className="text-muted-foreground">Importa y analiza tus datos financieros en tiempo real</p>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${transactions.length > 0 ? 'pb-48' : 'pb-32'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {transactions.length === 0 ? (
            <div className="space-y-6">
              <FinancialDropZone onFilesProcessed={(count) => setTransactionsCount(count)} />
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Arrastra archivos CSV exportados desde MercadoPago para comenzar
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Filters and Actions */}
              <div className="bg-card p-4 sm:p-6 border border-border space-y-4">
                {/* Date Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Desde</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hasta</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                      setSelectedCategory("")
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                  <button
                    onClick={exportData}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Borrar datos
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <FinancialCards transactions={displayTransactions} />

              {/* Chart Section */}
              <div className="bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Evolución Financiera</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 text-sm rounded ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                    >
                      Barras
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-1 text-sm rounded ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                    >
                      Línea
                    </button>
                  </div>
                </div>
                <FinancialChart transactions={displayTransactions} type={chartType} />
              </div>

              {/* Financial Insights */}
              {insights && (
                <FinancialInsights insights={insights} />
              )}

              {/* Recent Transactions */}
              <div className="bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">Transacciones Recientes</h2>
                <div className="space-y-2">
                  {currentTransactions.map((transaction, index) => (
                    <div key={`${transaction.reference}-${index}`} className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date.toLocaleDateString('es-ES')} • {transaction.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString('es-AR')}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, displayTransactions.length)} de {displayTransactions.length} transacciones
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Ir al primero */}
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Primera página"
                      >
                        ««
                      </button>

                      {/* Anterior */}
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                          if (pageNum > totalPages) return null
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-1 text-sm border rounded transition-colors ${
                                pageNum === currentPage
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      {/* Siguiente */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente
                      </button>

                      {/* Ir al último */}
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Última página"
                      >
                        »»
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Import Bar */}
      <FloatingImportBar />

      {/* Footer */}
      <Footer hasFloatingBar={true} />

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Borrar todos los datos?</h3>
            <p className="text-muted-foreground mb-4">
              Esta acción eliminará permanentemente todos los datos financieros importados. No se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-border rounded hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmClearData()
                  setShowConfirmDialog(false)
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                Borrar datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}