"use client"

import type { HealthMetric } from "@/lib/health-data-parser"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface StepsChartProps {
  metrics: HealthMetric[]
}

export function StepsChart({ metrics }: StepsChartProps) {
  if (!metrics.length) 
    return <div className="text-muted-foreground text-center py-8">No hay datos de pasos</div>

  // Filter and process data to show only metrics with steps
  const data = metrics
    .filter((m) => m.steps !== undefined && m.steps > 0)
    .map((m) => ({
      date: m.date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      fullDate: m.date.toLocaleDateString("es-ES"),
      steps: m.steps,
    }))

  if (data.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No hay datos de pasos disponibles</div>
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value: number) => [value.toLocaleString(), "Pasos"]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate
              }
              return label
            }}
          />
          <Bar 
            dataKey="steps" 
            fill="var(--color-chart-1)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
