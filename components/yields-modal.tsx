"use client"

import { useState, useEffect, useMemo } from "react"
import { X, TrendingUp, Calendar, DollarSign, BarChart3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { yieldsStore } from "@/lib/yields-store"
import { parseYieldsFile } from "@/lib/yields-data-parser"
import type { YieldEntry } from "@/lib/yields-data-parser"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { usePagination } from "@/hooks/usePagination"

interface YieldsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function YieldsModal({ isOpen, onClose }: YieldsModalProps) {
  const [yields, setYields] = useState<YieldEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setYields(yieldsStore.getYields())
    const unsubscribe = yieldsStore.subscribe(() => {
      setYields(yieldsStore.getYields())
    })
    return unsubscribe
  }, [])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Bloquear scroll y agregar padding
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      
      // Aplicar padding a elementos fixed
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], .fixed')
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.paddingRight = `${scrollbarWidth}px`
        }
      })
    } else {
      // Delay para esperar la animación de cierre del modal
      const timeoutId = setTimeout(() => {
        document.body.style.overflow = 'unset'
        document.body.style.paddingRight = '0px'
        
        // Remover padding de elementos fixed
        const fixedElements = document.querySelectorAll('[style*="position: fixed"], .fixed')
        fixedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.paddingRight = '0px'
          }
        })
      }, 200)
      
      return () => clearTimeout(timeoutId)
    }
    
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
      
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], .fixed')
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.paddingRight = '0px'
        }
      })
    }
  }, [isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const data = await parseYieldsFile(file)
      yieldsStore.addYields(data.yields)
      toast.success(`${data.yieldCount} rendimientos importados correctamente`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el archivo')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Paginación
  const pagination = usePagination(yields, 10)

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (yields.length === 0) return null

    const total = yields.reduce((sum, y) => sum + y.amount, 0)
    const average = total / yields.length

    // Agrupar por mes para el gráfico
    const monthlyData = new Map<string, number>()
    yields.forEach(y => {
      const monthKey = `${y.date.getFullYear()}-${String(y.date.getMonth() + 1).padStart(2, '0')}`
      const current = monthlyData.get(monthKey) || 0
      monthlyData.set(monthKey, current + y.amount)
    })

    const chartData = Array.from(monthlyData.entries())
      .map(([monthKey, amount]) => {
        const [year, month] = monthKey.split('-').map(Number)
        const date = new Date(year, month - 1)
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          amount,
          sortKey: date.getTime()
        }
      })
      .sort((a, b) => a.sortKey - b.sortKey)

    return { total, average, chartData }
  }, [yields])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold">Rendimientos</h2>
              <p className="text-sm text-muted-foreground">
                {yields.length} rendimiento{yields.length !== 1 ? 's' : ''} 
                {stats && ` • Total: ${formatCurrency(stats.total)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {yields.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay rendimientos</h3>
              <p className="text-muted-foreground mb-6">
                Importa un archivo JSON con tus rendimientos de MercadoPago
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                <TrendingUp className="w-4 h-4" />
                {isLoading ? 'Procesando...' : 'Importar rendimientos'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Import button */}
              <div className="flex justify-between items-center">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  {isLoading ? 'Procesando...' : 'Importar más rendimientos'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <DollarSign className="w-4 h-4" />
                      Total Rendimientos
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.total)}
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <BarChart3 className="w-4 h-4" />
                      Promedio
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats.average)}
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Cantidad
                    </div>
                    <div className="text-2xl font-bold">
                      {yields.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              {stats && stats.chartData.length > 0 && (
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Rendimientos Mensuales</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                          tickFormatter={(value) => `$${value.toFixed(0)}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "0.5rem",
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Rendimiento']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: "#10b981", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Yields list */}
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Historial de Rendimientos</h3>
                <div className="space-y-2">
                  {pagination.currentItems.map((yieldEntry, index) => (
                    <div
                      key={`${yieldEntry.date.getTime()}-${index}`}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{yieldEntry.description}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(yieldEntry.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +{formatCurrency(yieldEntry.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Balance: {formatCurrency(yieldEntry.partialBalance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {pagination.startIndex + 1} a {Math.min(pagination.endIndex, yields.length)} de {yields.length} rendimientos
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={pagination.goToFirstPage}
                        disabled={!pagination.hasPreviousPage}
                        className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Primera página"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={pagination.goToPreviousPage}
                        disabled={!pagination.hasPreviousPage}
                        className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm px-3">
                        Página {pagination.currentPage} de {pagination.totalPages}
                      </span>
                      <button
                        onClick={pagination.goToNextPage}
                        disabled={!pagination.hasNextPage}
                        className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Página siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={pagination.goToLastPage}
                        disabled={!pagination.hasNextPage}
                        className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Última página"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {yields.length > 0 && (
          <div className="border-t border-border p-4 flex justify-between items-center">
            <button
              onClick={() => {
                yieldsStore.clearYields()
                toast.success('Rendimientos eliminados')
              }}
              className="text-sm text-destructive hover:underline"
            >
              Limpiar todos
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
