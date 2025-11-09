"use client"

import type { FinancialTransaction } from "@/lib/financial-data-parser"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

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
    current.net = current.credits - current.debits

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
        debits: data.debits,
        net: data.net
      }
    })
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ')
      const [bMonth, bYear] = b.month.split(' ')
      if (aYear !== bYear) return aYear.localeCompare(bYear)
      return aMonth.localeCompare(bMonth)
    })

  if (chartData.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No hay suficientes datos para generar el gráfico</div>
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
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
              tickFormatter={formatCurrency}
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
                name === 'net' ? 'Saldo Neto' : name === 'credits' ? 'Ingresos' : 'Gastos'
              ]}
              labelFormatter={(label) => `Mes: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="var(--color-chart-1)"
              strokeWidth={3}
              dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
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
            tickFormatter={formatCurrency}
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
              name === 'credits' ? 'Ingresos' : name === 'debits' ? 'Gastos' : 'Saldo Neto'
            ]}
            labelFormatter={(label) => `Mes: ${label}`}
          />
          <Bar
            dataKey="credits"
            fill="var(--color-chart-2)"
            radius={[2, 2, 0, 0]}
            name="Ingresos"
          />
          <Bar
            dataKey="debits"
            fill="var(--color-chart-1)"
            radius={[2, 2, 0, 0]}
            name="Gastos"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}