"use client"

import { useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/EmptyState"
import { FinancialCards } from "@/components/financial-cards"
import { FinancialInsights } from "@/components/financial-insights"
import { FloatingImportBar } from "@/components/floating-import-bar"
import { Footer } from "@/components/footer"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"
import { DashboardActions } from "@/components/dashboard/DashboardActions"
import { ChartSection } from "@/components/dashboard/ChartSection"
import { TransactionsList } from "@/components/dashboard/TransactionsList"
import { TransactionsPagination } from "@/components/dashboard/TransactionsPagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFinancialData } from "@/hooks/useFinancialData"
import { useFilters } from "@/hooks/useFilters"
import { usePagination } from "@/hooks/usePagination"
import { FinancialDataService } from "@/lib/services/financial-data.service"
import { ExportService } from "@/lib/services/export.service"

/**
 * Dashboard principal de la aplicación
 * Responsabilidad: Orquestar componentes y manejar flujo principal
 */
export default function FinancialDashboard() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Hooks personalizados
  const { transactions, insights, categories } = useFinancialData()
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedCategory,
    setSelectedCategory,
    filteredTransactions,
    clearFilters
  } = useFilters(transactions)

  const pagination = usePagination(filteredTransactions, 50)

  // Handlers
  const handleClearData = () => {
    setShowConfirmDialog(true)
  }

  const confirmClearData = () => {
    FinancialDataService.clearAllData()
    clearFilters()
    toast.success("Datos borrados", {
      description: "Todos los datos financieros han sido eliminados"
    })
  }

  const handleExport = () => {
    try {
      ExportService.exportToCSV(filteredTransactions)
      toast.success("Datos exportados", {
        description: "Archivo CSV descargado exitosamente"
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al exportar datos")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      {/* Main Content */}
      <main className={`flex-1 ${transactions.length > 0 ? 'pb-48' : ''}`}>
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">(
            <div className="space-y-8">
              {/* Filters and Actions */}
              <div className="bg-card p-4 sm:p-6 border border-border space-y-4">
                <DashboardFilters
                  startDate={startDate}
                  endDate={endDate}
                  selectedCategory={selectedCategory}
                  categories={categories}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onCategoryChange={setSelectedCategory}
                />
                <DashboardActions
                  onClearFilters={clearFilters}
                  onExport={handleExport}
                  onClearData={handleClearData}
                />
              </div>

              {/* Summary Cards */}
              <FinancialCards transactions={filteredTransactions} />

              {/* Chart Section */}
              <ChartSection transactions={filteredTransactions} />

              {/* Financial Insights */}
              {insights && <FinancialInsights insights={insights} />}

              {/* Recent Transactions */}
              <div className="bg-card border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">Transacciones Recientes</h2>
                <TransactionsList transactions={pagination.currentItems} />
                <TransactionsPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                  totalItems={filteredTransactions.length}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onGoToPage={pagination.goToPage}
                  onGoToFirstPage={pagination.goToFirstPage}
                  onGoToLastPage={pagination.goToLastPage}
                  onGoToNextPage={pagination.goToNextPage}
                  onGoToPreviousPage={pagination.goToPreviousPage}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Import Bar */}
      <FloatingImportBar />

      {/* Footer */}
      <Footer hasFloatingBar={true} />

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar todos los datos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todos los datos financieros importados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearData} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Borrar datos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
