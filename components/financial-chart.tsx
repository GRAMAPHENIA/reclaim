"use client"

import type { FinancialTransaction } from "@/lib/financial-data-parser"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, Legend } from "recharts"

interface FinancialChartProps {
  transactions: FinancialTransaction[]
  type?: 'bar' | 'line'
}

export function FinancialChart({ transactions, type = 'bar' }: FinancialChartProps) {
  if (!transactions.length) {
    return <div className="text-muted-foreground text-center py-8">No hay datos financieros para mostrar</div>
  }

  // Agrupar por mes para la visualización
  const monthlyData = new Map<string, { credits: number, debits: number, net: number }>()

  transactions.forEach(transaction => {
    const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`
    const current = monthlyData.get(monthKey) || { credits: 0, debits: 0, net: 0 }

    if (transaction.type === 'credit') {
      current.credits += transaction.amount
    } else {
      current.debits += transaction.amount
    }

    monthlyData.set(monthKey, current)
  })

  // Convertir a array para el gráfico
  const chartData = Array.from(monthlyData.entries())
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number)
      const date = new Date(year, month - 1)
      return {
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        fullMonth: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        credits: data.credits,
        debits: data.debits, // Positivo para mostrar hacia arriba
        net: data.credits - data.debits,
        sortKey: date.getTime()
      }
    })
    .sort((a, b) => a.sortKey - b.sortKey)

  if (chartData.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No hay suficientes datos para generar el gráfico</div>
  }

  // Formato compacto para ejes (K, M)
  const formatCompactCurrency = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000000) {
      return `$${(absValue / 1000000).toFixed(1)}M`
    }
    if (absValue >= 1000) {
      return `$${(absValue / 1000).toFixed(1)}K`
    }
    return `$${absValue.toFixed(0)}`
  }

  // Formato completo para tooltips
  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
  }

  if (type === 'line') {
    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={formatCompactCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
              formatter={(value: number, name: string) => [
                Math.abs(value).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
                name
              ]}
              labelFormatter={(label) => label}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="credits"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="Ingresos"
            />
            <Line
              type="monotone"
              dataKey="debits"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              name="Gastos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickFormatter={formatCompactCurrency}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'Ingresos' ? 'Ingresos' : 'Gastos'
            ]}
            labelFormatter={(label) => label}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar
            dataKey="credits"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            name="Ingresos"
          />
          <Bar
            dataKey="debits"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            name="Gastos"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}