// Sistema de pronósticos y analytics financieros avanzados

import type { FinancialTransaction } from "./financial-data-parser"

export interface FinancialForecast {
  nextMonthIncome: number
  nextMonthExpenses: number
  nextMonthNet: number
  confidence: number // 0-100
  basedOnMonths: number
}

export interface SpendingPattern {
  category: string
  averageMonthly: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercentage: number
  lastMonthAmount: number
  predictedNextMonth: number
}

export interface FinancialInsights {
  forecasts: FinancialForecast
  spendingPatterns: SpendingPattern[]
  alerts: FinancialAlert[]
  recommendations: string[]
}

export interface FinancialAlert {
  type: 'warning' | 'danger' | 'info'
  title: string
  description: string
  category?: string
  amount?: number
}

// Función principal para generar pronósticos
export function generateFinancialForecast(transactions: FinancialTransaction[]): FinancialInsights {
  const monthlyData = groupTransactionsByMonth(transactions)
  const forecasts = calculateForecast(monthlyData)
  const spendingPatterns = analyzeSpendingPatterns(monthlyData)
  const alerts = generateAlerts(transactions, spendingPatterns)
  const recommendations = generateRecommendations(spendingPatterns, forecasts)

  return {
    forecasts,
    spendingPatterns,
    alerts,
    recommendations
  }
}

// Agrupar transacciones por mes
function groupTransactionsByMonth(transactions: FinancialTransaction[]) {
  const monthlyData: Record<string, {
    income: number
    expenses: number
    categories: Record<string, number>
  }> = {}

  transactions.forEach(transaction => {
    const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        income: 0,
        expenses: 0,
        categories: {}
      }
    }

    if (transaction.type === 'credit') {
      monthlyData[monthKey].income += transaction.amount
    } else {
      monthlyData[monthKey].expenses += transaction.amount
      monthlyData[monthKey].categories[transaction.category] =
        (monthlyData[monthKey].categories[transaction.category] || 0) + transaction.amount
    }
  })

  return monthlyData
}

// Calcular pronósticos basados en datos históricos
function calculateForecast(monthlyData: Record<string, any>): FinancialForecast {
  const months = Object.keys(monthlyData).sort()
  const recentMonths = months.slice(-6) // Usar últimos 6 meses para pronóstico

  if (recentMonths.length < 2) {
    return {
      nextMonthIncome: 0,
      nextMonthExpenses: 0,
      nextMonthNet: 0,
      confidence: 0,
      basedOnMonths: recentMonths.length
    }
  }

  // Calcular promedios de ingresos y gastos
  const incomes = recentMonths.map(month => monthlyData[month].income)
  const expenses = recentMonths.map(month => monthlyData[month].expenses)

  const avgIncome = incomes.reduce((sum, val) => sum + val, 0) / incomes.length
  const avgExpenses = expenses.reduce((sum, val) => sum + val, 0) / expenses.length

  // Calcular tendencia (usando regresión lineal simple)
  const incomeTrend = calculateTrend(incomes)
  const expenseTrend = calculateTrend(expenses)

  // Pronosticar próximo mes aplicando tendencia
  const nextMonthIncome = Math.max(0, avgIncome * (1 + incomeTrend))
  const nextMonthExpenses = Math.max(0, avgExpenses * (1 + expenseTrend))

  // Calcular confianza basada en variabilidad de datos
  const incomeVariability = calculateVariability(incomes)
  const expenseVariability = calculateVariability(expenses)
  const avgVariability = (incomeVariability + expenseVariability) / 2
  const confidence = Math.max(0, Math.min(100, 100 - (avgVariability * 100)))

  return {
    nextMonthIncome: Math.round(nextMonthIncome),
    nextMonthExpenses: Math.round(nextMonthExpenses),
    nextMonthNet: Math.round(nextMonthIncome - nextMonthExpenses),
    confidence: Math.round(confidence),
    basedOnMonths: recentMonths.length
  }
}

// Calcular tendencia usando regresión lineal simple
function calculateTrend(values: number[]): number {
  const n = values.length
  if (n < 2) return 0

  const x = Array.from({ length: n }, (_, i) => i)
  const y = values

  const sumX = x.reduce((sum, val) => sum + val, 0)
  const sumY = y.reduce((sum, val) => sum + val, 0)
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
  const sumXX = x.reduce((sum, val) => sum + val * val, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

  // Retornar cambio porcentual promedio por período
  const avgValue = sumY / n
  return avgValue > 0 ? slope / avgValue : 0
}

// Calcular variabilidad (coeficiente de variación)
function calculateVariability(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  if (mean === 0) return 0

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  return stdDev / mean // Coeficiente de variación
}

// Analizar patrones de gasto por categoría
function analyzeSpendingPatterns(monthlyData: Record<string, any>): SpendingPattern[] {
  const months = Object.keys(monthlyData).sort()
  const recentMonths = months.slice(-6)

  if (recentMonths.length < 2) return []

  // Recopilar datos por categoría
  const categoryData: Record<string, number[]> = {}

  recentMonths.forEach(month => {
    Object.entries(monthlyData[month].categories).forEach(([category, amount]) => {
      if (!categoryData[category]) {
        categoryData[category] = []
      }
      categoryData[category].push(amount as number)
    })
  })

  // Calcular patrones para cada categoría
  const patterns: SpendingPattern[] = []

  Object.entries(categoryData).forEach(([category, amounts]) => {
    if (amounts.length < 2) return

    const averageMonthly = amounts.reduce((sum, val) => sum + val, 0) / amounts.length
    const trend = calculateTrend(amounts)
    const trendPercentage = trend * 100
    const lastMonthAmount = amounts[amounts.length - 1]
    const predictedNextMonth = Math.max(0, lastMonthAmount * (1 + trend))

    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (Math.abs(trendPercentage) > 5) {
      trendDirection = trendPercentage > 0 ? 'increasing' : 'decreasing'
    }

    patterns.push({
      category,
      averageMonthly: Math.round(averageMonthly),
      trend: trendDirection,
      trendPercentage: Math.round(trendPercentage * 100) / 100,
      lastMonthAmount: Math.round(lastMonthAmount),
      predictedNextMonth: Math.round(predictedNextMonth)
    })
  })

  return patterns.sort((a, b) => b.averageMonthly - a.averageMonthly)
}

// Generar alertas basadas en patrones y datos actuales
function generateAlerts(transactions: FinancialTransaction[], patterns: SpendingPattern[]): FinancialAlert[] {
  const alerts: FinancialAlert[] = []

  // Alerta por gastos que aumentan rápidamente
  patterns.forEach(pattern => {
    if (pattern.trend === 'increasing' && Math.abs(pattern.trendPercentage) > 20) {
      alerts.push({
        type: 'warning',
        title: `Gasto creciente en ${pattern.category}`,
        description: `Los gastos en ${pattern.category} han aumentado un ${pattern.trendPercentage}% en promedio. Revisa si es necesario.`,
        category: pattern.category,
        amount: pattern.predictedNextMonth
      })
    }
  })

  // Alerta por categorías con gasto muy alto
  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  patterns.forEach(pattern => {
    const percentageOfTotal = (pattern.averageMonthly / (totalExpenses / patterns.length)) * 100
    if (percentageOfTotal > 50) { // Más del 50% del gasto total
      alerts.push({
        type: 'info',
        title: `Categoría dominante: ${pattern.category}`,
        description: `${pattern.category} representa aproximadamente el ${Math.round(percentageOfTotal)}% de tus gastos totales.`,
        category: pattern.category,
        amount: pattern.averageMonthly
      })
    }
  })

  // Alerta por gastos inusuales (última transacción muy alta)
  const recentTransactions = transactions
    .filter(t => t.type === 'debit')
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)

  recentTransactions.forEach(transaction => {
    const categoryPattern = patterns.find(p => p.category === transaction.category)
    if (categoryPattern && transaction.amount > categoryPattern.averageMonthly * 2) {
      alerts.push({
        type: 'warning',
        title: 'Gasto inusual detectado',
        description: `Transacción de $${transaction.amount.toLocaleString()} en ${transaction.category}, mucho mayor que el promedio mensual de $${categoryPattern.averageMonthly.toLocaleString()}.`,
        category: transaction.category,
        amount: transaction.amount
      })
    }
  })

  return alerts.slice(0, 5) // Máximo 5 alertas
}

// Generar recomendaciones basadas en análisis
function generateRecommendations(patterns: SpendingPattern[], forecast: FinancialForecast): string[] {
  const recommendations: string[] = []

  // Recomendación por ahorro si hay saldo positivo proyectado
  if (forecast.nextMonthNet > 0) {
    const savingsPercentage = Math.min(20, (forecast.nextMonthNet / forecast.nextMonthIncome) * 100)
    recommendations.push(`Considera ahorrar el ${Math.round(savingsPercentage)}% de tus ingresos proyectados ($${Math.round(forecast.nextMonthNet * savingsPercentage / 100).toLocaleString()}) para construir un fondo de emergencia.`)
  }

  // Recomendación por categorías con tendencia creciente
  const increasingCategories = patterns.filter(p => p.trend === 'increasing' && p.trendPercentage > 10)
  if (increasingCategories.length > 0) {
    const topIncreasing = increasingCategories[0]
    recommendations.push(`Revisa tus gastos en ${topIncreasing.category} que están aumentando un ${topIncreasing.trendPercentage}% mensualmente. Considera alternativas más económicas.`)
  }

  // Recomendación por diversificación de ingresos si hay pocas fuentes
  const incomeTransactions = patterns.filter(p => p.averageMonthly > 0 && p.category.includes('Ingreso'))
  if (incomeTransactions.length === 1) {
    recommendations.push('Considera diversificar tus fuentes de ingresos. Tener múltiples streams puede reducir riesgos financieros.')
  }

  // Recomendación general por presupuesto
  if (forecast.confidence > 70) {
    recommendations.push('Tu patrón financiero es predecible. Considera crear un presupuesto mensual basado en estos datos históricos.')
  }

  return recommendations.slice(0, 3) // Máximo 3 recomendaciones
}

// Función de utilidad para formatear moneda
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return amount.toLocaleString('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Función de utilidad para formatear porcentaje
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}