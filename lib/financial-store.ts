// Store para datos financieros (similar al health-store pero para finanzas)

import type { FinancialTransaction, ProcessedFinancialData } from "./financial-data-parser"

type Listener = () => void

class FinancialStore {
  private data: ProcessedFinancialData | null = null
  private listeners: Set<Listener> = new Set()

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener); }
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  addFinancialData(newData: ProcessedFinancialData) {
    // Combinar con datos existentes si los hay
    if (this.data) {
      const combinedTransactions = [...this.data.transactions, ...newData.transactions]
      // Remover duplicados basados en referencia y fecha
      const uniqueTransactions = combinedTransactions.filter((transaction, index, self) =>
        index === self.findIndex(t =>
          t.reference === transaction.reference &&
          t.date.getTime() === transaction.date.getTime() &&
          t.amount === transaction.amount
        )
      )

      this.data = {
        transactions: uniqueTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()),
        summary: {
          totalCredits: uniqueTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
          totalDebits: uniqueTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
          netBalance: 0, // Se calcula abajo
          transactionCount: uniqueTransactions.length,
          period: {
            start: uniqueTransactions.length > 0 ? new Date(Math.min(...uniqueTransactions.map(t => t.date.getTime()))) : new Date(),
            end: uniqueTransactions.length > 0 ? new Date(Math.max(...uniqueTransactions.map(t => t.date.getTime()))) : new Date()
          },
          topCategories: this.calculateTopCategories(uniqueTransactions)
        }
      }
      this.data.summary.netBalance = this.data.summary.totalCredits - this.data.summary.totalDebits
    } else {
      this.data = newData
    }

    this.notify()
  }

  private calculateTopCategories(transactions: FinancialTransaction[]) {
    const categoryStats = new Map<string, { amount: number, count: number }>()
    transactions.forEach(t => {
      if (t.type === 'debit') { // Solo contar egresos para categorías
        const key = t.category
        const current = categoryStats.get(key) || { amount: 0, count: 0 }
        categoryStats.set(key, {
          amount: current.amount + t.amount,
          count: current.count + 1
        })
      }
    })

    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }

  getFinancialData(): ProcessedFinancialData | null {
    return this.data ? { ...this.data } : null
  }

  getTransactions(): FinancialTransaction[] {
    return this.data ? [...this.data.transactions] : []
  }

  getTransactionsInRange(startDate: Date, endDate: Date): FinancialTransaction[] {
    if (!this.data) return []
    return this.data.transactions.filter((t) => t.date >= startDate && t.date <= endDate)
  }

  getTransactionsByCategory(category: string): FinancialTransaction[] {
    if (!this.data) return []
    return this.data.transactions.filter((t) => t.category === category)
  }

  getMonthlySummary(): Array<{
    month: string
    year: number
    credits: number
    debits: number
    net: number
    transactionCount: number
  }> {
    if (!this.data) return []

    const monthlyData = new Map<string, {
      credits: number
      debits: number
      transactionCount: number
    }>()

    this.data.transactions.forEach(transaction => {
      const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`
      const current = monthlyData.get(monthKey) || { credits: 0, debits: 0, transactionCount: 0 }

      if (transaction.type === 'credit') {
        current.credits += transaction.amount
      } else {
        current.debits += transaction.amount
      }
      current.transactionCount += 1

      monthlyData.set(monthKey, current)
    })

    return Array.from(monthlyData.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-').map(Number)
        return {
          month: new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          year,
          credits: data.credits,
          debits: data.debits,
          net: data.credits - data.debits,
          transactionCount: data.transactionCount
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month.localeCompare(a.month)
      })
  }

  clearFinancialData() {
    this.data = null
    this.notify()
  }

  // Método para obtener estadísticas rápidas
  getQuickStats() {
    if (!this.data) return null

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthTransactions = this.data.transactions.filter(t =>
      t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
    )

    const currentMonthCredits = currentMonthTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentMonthDebits = currentMonthTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalBalance: this.data.summary.netBalance,
      currentMonthCredits,
      currentMonthDebits,
      currentMonthNet: currentMonthCredits - currentMonthDebits,
      totalTransactions: this.data.summary.transactionCount,
      currentMonthTransactions: currentMonthTransactions.length
    }
  }
}

export const financialStore = new FinancialStore()