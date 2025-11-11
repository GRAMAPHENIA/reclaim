"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { financialStore } from "@/lib/financial-store"
import { generateFinancialForecast } from "@/lib/financial-analytics"
import type { FinancialTransaction } from "@/lib/financial-data-parser"
import type { FinancialInsights } from "@/lib/financial-analytics"

/**
 * Context para estado financiero global
 * Responsabilidad: Proveer estado financiero a toda la aplicación
 */

interface FinancialContextType {
  // Estado
  transactions: FinancialTransaction[]
  insights: FinancialInsights | null
  categories: string[]
  isLoading: boolean

  // Acciones
  refreshData: () => void
  clearAllData: () => void
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

/**
 * Provider del contexto financiero
 */
export function FinancialProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [insights, setInsights] = useState<FinancialInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cargar datos iniciales y suscribirse a cambios
  useEffect(() => {
    setIsLoading(true)
    setTransactions(financialStore.getTransactions())
    setIsLoading(false)

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

  // Refrescar datos
  const refreshData = () => {
    setTransactions(financialStore.getTransactions())
  }

  // Limpiar todos los datos
  const clearAllData = () => {
    financialStore.clearFinancialData()
    setTransactions([])
    setInsights(null)
  }

  const value: FinancialContextType = {
    transactions,
    insights,
    categories,
    isLoading,
    refreshData,
    clearAllData
  }

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  )
}

/**
 * Hook para usar el contexto financiero
 */
export function useFinancialContext() {
  const context = useContext(FinancialContext)
  
  if (context === undefined) {
    throw new Error('useFinancialContext debe usarse dentro de un FinancialProvider')
  }
  
  return context
}

/**
 * Hook opcional que retorna undefined si no está dentro del provider
 */
export function useOptionalFinancialContext() {
  return useContext(FinancialContext)
}
