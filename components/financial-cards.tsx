"use client"

import type { FinancialTransaction } from "@/lib/financial-data-parser"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart } from "lucide-react"

interface FinancialCardsProps {
  transactions: FinancialTransaction[]
}

export function FinancialCards({ transactions }: FinancialCardsProps) {
  if (!transactions.length) {
    return null
  }

  // Calcular métricas principales
  const credits = transactions.filter(t => t.type === 'credit')
  const debits = transactions.filter(t => t.type === 'debit')

  const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalCredits - totalDebits

  // Calcular promedio mensual (últimos 30 días)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo)
  const recentCredits = recentTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const recentDebits = recentTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)

  // Categoría más gastada
  const categorySpending = new Map<string, number>()
  debits.forEach(t => {
    const current = categorySpending.get(t.category) || 0
    categorySpending.set(t.category, current + t.amount)
  })

  const topCategory = Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])[0]

  const cards = [
    {
      title: "Saldo Total",
      value: netBalance,
      unit: "ARS",
      icon: DollarSign,
      color: netBalance >= 0
        ? "bg-[oklch(0.96_0.02_120)] dark:bg-[oklch(0.15_0.04_120)]"
        : "bg-[oklch(0.96_0.02_0)] dark:bg-[oklch(0.15_0.04_0)]",
      iconColor: netBalance >= 0
        ? "text-[oklch(0.35_0.18_120)] dark:text-[oklch(0.65_0.20_120)]"
        : "text-[oklch(0.35_0.18_0)] dark:text-[oklch(0.65_0.20_0)]",
      format: (value: number) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    },
    {
      title: "Ingresos (30 días)",
      value: recentCredits,
      unit: "ARS",
      icon: TrendingUp,
      color: "bg-[oklch(0.96_0.02_120)] dark:bg-[oklch(0.15_0.04_120)]",
      iconColor: "text-[oklch(0.35_0.18_120)] dark:text-[oklch(0.65_0.20_120)]",
      format: (value: number) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    },
    {
      title: "Gastos (30 días)",
      value: recentDebits,
      unit: "ARS",
      icon: TrendingDown,
      color: "bg-[oklch(0.96_0.02_0)] dark:bg-[oklch(0.15_0.04_0)]",
      iconColor: "text-[oklch(0.35_0.18_0)] dark:text-[oklch(0.65_0.20_0)]",
      format: (value: number) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    },
    {
      title: "Categoría Principal",
      value: topCategory ? topCategory[0] : "Sin datos",
      unit: topCategory ? topCategory[1].toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : "",
      icon: PieChart,
      color: "bg-[oklch(0.96_0.02_60)] dark:bg-[oklch(0.15_0.04_60)]",
      iconColor: "text-[oklch(0.35_0.18_60)] dark:text-[oklch(0.65_0.20_60)]",
      format: (value: any) => value
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div key={card.title} className={`p-6 ${card.color} rounded-lg`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              </div>
              <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-bold">{card.format(card.value)}</p>
            {card.unit && card.title !== "Categoría Principal" && (
              <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>
            )}
            {card.title === "Categoría Principal" && card.unit && (
              <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}