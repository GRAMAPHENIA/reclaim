import { useEffect, useState } from "react"
import type { FinancialTransaction } from "@/lib/financial-data-parser"

/**
 * Hook personalizado para manejar filtros de transacciones
 * Responsabilidad: Gestionar estado de filtros y aplicarlos
 */
export function useFilters(transactions: FinancialTransaction[]) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = transactions

    if (startDate) {
      const start = new Date(startDate)
      filtered = filtered.filter((t) => t.date >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((t) => t.date <= end)
    }

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    setFilteredTransactions(filtered)
  }, [transactions, startDate, endDate, selectedCategory])

  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
    setSelectedCategory("")
  }

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedCategory,
    setSelectedCategory,
    filteredTransactions,
    clearFilters
  }
}
