"use client"

import type { HealthMetric } from "@/lib/health-data-parser"
import { Activity, Heart, Moon, Flame } from "lucide-react"

interface SummaryCardsProps {
  metrics: HealthMetric[]
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  if (!metrics.length) {
    return null
  }

  const latestDate = metrics[metrics.length - 1]
  const avgSteps = Math.round(metrics.reduce((sum, m) => sum + (m.steps || 0), 0) / metrics.length)
  const avgHeartRate = Math.round(
    metrics.reduce((sum, m) => sum + (m.heartRate || 0), 0) / metrics.filter((m) => m.heartRate).length || 0,
  )
  // Filter sleep metrics with realistic values (1-16 hours, excluding 24-hour values)
  const sleepMetrics = metrics.filter((m) => 
    m.sleepDuration && 
    m.sleepDuration >= 60 && 
    m.sleepDuration <= 960 &&
    m.sleepDuration !== 1440
  )
  const totalSleep = sleepMetrics.reduce((sum, m) => sum + (m.sleepDuration || 0), 0)
  const avgSleepMinutes = sleepMetrics.length > 0 ? totalSleep / sleepMetrics.length : 0
  const avgSleep = sleepMetrics.length > 0 ? (avgSleepMinutes / 60).toFixed(1) : "0.0"

  const cards = [
    {
      title: "Últimos pasos",
      value: latestDate.steps || 0,
      unit: "pasos",
      icon: Activity,
      color: "bg-[oklch(0.96_0.02_220)] dark:bg-[oklch(0.15_0.04_220)]",
      iconColor: "text-[oklch(0.35_0.18_220)] dark:text-[oklch(0.65_0.20_220)]",
    },
    {
      title: "Ritmo cardíaco promedio",
      value: avgHeartRate,
      unit: "bpm",
      icon: Heart,
      color: "bg-[oklch(0.94_0.03_220)] dark:bg-[oklch(0.18_0.05_220)]",
      iconColor: "text-[oklch(0.28_0.20_220)] dark:text-[oklch(0.58_0.22_220)]",
    },
    {
      title: "Sueño promedio",
      value: avgSleep,
      unit: "horas",
      icon: Moon,
      color: "bg-[oklch(0.96_0.02_160)] dark:bg-[oklch(0.15_0.04_160)]",
      iconColor: "text-[oklch(0.42_0.15_160)] dark:text-[oklch(0.72_0.18_160)]",
    },
    {
      title: "Calorías promedio",
      value: Math.round(
        metrics.reduce((sum, m) => sum + (m.calories || 0), 0) / metrics.filter((m) => m.calories).length || 0,
      ),
      unit: "kcal",
      icon: Flame,
      color: "bg-[oklch(0.94_0.03_160)] dark:bg-[oklch(0.18_0.05_160)]",
      iconColor: "text-[oklch(0.48_0.12_160)] dark:text-[oklch(0.78_0.15_160)]",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div key={card.title} className={`p-6 ${card.color}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              </div>
              <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>
          </div>
        )
      })}
    </div>
  )
}
