"use client"

import type { HealthMetric } from "@/lib/health-data-parser"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SleepChartProps {
  metrics: HealthMetric[]
}

export function SleepChart({ metrics }: SleepChartProps) {
  if (!metrics.length) 
    return <div className="text-muted-foreground text-center py-8">No hay datos de sueño</div>

  const data = metrics
    .filter((m) => {
      // Filter out unrealistic values: sleep should be between 1 hour and 16 hours (60-960 minutes)
      return m.sleepDuration !== undefined && 
             m.sleepDuration >= 60 && 
             m.sleepDuration <= 960 &&
             m.sleepDuration !== 1440 // Specifically filter out 24-hour values
    })
    .map((m) => ({
      date: m.date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      fullDate: m.date.toLocaleDateString("es-ES"),
      sleep: Number((m.sleepDuration! / 60).toFixed(1)), // Convert minutes to hours with 1 decimal
      sleepMinutes: m.sleepDuration,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  if (data.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No hay datos de sueño disponibles</div>
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
            domain={[0, 16]} // Realistic sleep range: 0-16 hours
            label={{ 
              value: "Horas", 
              angle: -90, 
              position: "insideLeft",
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value: number, name, props) => {
              const minutes = props.payload.sleepMinutes
              const hours = Math.floor(minutes / 60)
              const mins = minutes % 60
              return [`${hours}h ${mins}m`, "Duración"]
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate
              }
              return label
            }}
          />
          <Bar 
            dataKey="sleep" 
            fill="var(--color-chart-3)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
