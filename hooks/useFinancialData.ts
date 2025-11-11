import { useEffect, useState } from "react"
import { financialStore } from "@/lib/financial-store"
import { generateFinancialForecast } from "@/lib/financial-analytics"
import type { FinancialTransaction } from "@/lib/financial-data-parser"
import type { FinancialInsights } from "@/lib/financial-analytics"

/**
 * Hook personalizado para manejar datos financieros
 * Responsabilidad: Gestionar el estado de transacciones e insights
 */
export function useFinancialData() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [insights, setInsights] = useState<FinancialInsights | null>(null)

  // Suscribirse a cambios en el store
  useEffect(() => {
    setTransactions(financialStore.getTransactions())

    const unsubscribe = financialStore.subscribe(() => {
      setTransactions(financialStore.getTransactions())
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

  // Obtener categorías únicas
  const categories = Array.from(new Set(transactions.map(t => t.category))).sort()

  return {
    transactions,
    insights,
    categories
  }
}
