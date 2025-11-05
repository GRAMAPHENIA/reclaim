"use client"

import type { HealthMetric } from "@/lib/health-data-parser"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface HeartRateChartProps {
  metrics: HealthMetric[]
}

export function HeartRateChart({ metrics }: HeartRateChartProps) {
  if (!metrics.length)
    return <div className="text-muted-foreground text-center py-8">No hay datos de ritmo cardíaco</div>

  // Debug: Log metrics received
  const heartRateMetrics = metrics.filter(m => m.heartRate !== undefined && m.heartRate > 0)
  console.log('HeartRateChart - Métricas recibidas:', metrics.length)
  console.log('HeartRateChart - Métricas con ritmo cardíaco:', heartRateMetrics.length)
  
  const data = metrics
    .map((m) => ({
      timestamp: m.date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      date: m.date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      heartRate: m.heartRate,
    }))
    .filter((d) => d.heartRate !== undefined && d.heartRate > 0)

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        <p>No hay datos de ritmo cardíaco disponibles</p>
        <p className="text-sm mt-2">
          Total métricas: {metrics.length} | Con ritmo cardíaco: {heartRateMetrics.length}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="timestamp" 
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
            formatter={(value: number) => [value, "BPM"]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `${payload[0].payload.date} - ${label}`
              }
              return label
            }}
          />
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="var(--color-chart-2)"
            dot={{ fill: "var(--color-chart-2)", strokeWidth: 2, r: 3 }}
            strokeWidth={2}
            isAnimationActive={true}
            name="BPM"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
