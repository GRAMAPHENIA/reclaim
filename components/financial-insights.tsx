"use client"

import type { FinancialInsights } from "@/lib/financial-analytics"
import { TrendingUp, TrendingDown, AlertTriangle, Info, Lightbulb, Target } from "lucide-react"

interface FinancialInsightsProps {
  insights: FinancialInsights
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  if (!insights) return null

  const { forecasts, spendingPatterns, alerts, recommendations } = insights

  return (
    <div className="space-y-6">
      {/* Pronósticos */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Pronósticos del Próximo Mes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Ingresos Proyectados</p>
            <p className="text-2xl font-bold text-green-600">
              ${forecasts.nextMonthIncome.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Gastos Proyectados</p>
            <p className="text-2xl font-bold text-red-600">
              ${forecasts.nextMonthExpenses.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Saldo Neto</p>
            <p className={`text-2xl font-bold ${forecasts.nextMonthNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${forecasts.nextMonthNet.toLocaleString('es-AR')}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Confianza del pronóstico: <span className="font-semibold">{forecasts.confidence}%</span>
            <span className="text-xs ml-2">(basado en {forecasts.basedOnMonths} meses de datos)</span>
          </p>
        </div>
      </div>

      {/* Patrones de Gasto */}
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Patrones de Gasto</h2>
        </div>

        <div className="space-y-3">
          {spendingPatterns.slice(0, 5).map((pattern) => (
            <div key={pattern.category} className="flex items-center justify-between p-3 border border-border rounded">
              <div className="flex-1">
                <p className="font-medium">{pattern.category}</p>
                <p className="text-sm text-muted-foreground">
                  Promedio mensual: ${pattern.averageMonthly.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {pattern.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {pattern.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                  <span className={`text-sm font-medium ${
                    pattern.trend === 'increasing' ? 'text-red-500' :
                    pattern.trend === 'decreasing' ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    {pattern.trendPercentage >= 0 ? '+' : ''}{pattern.trendPercentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Próximo mes: ${pattern.predictedNextMonth.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Alertas y Observaciones</h2>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                alert.type === 'danger' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                alert.type === 'warning' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950' :
                'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
              }`}>
                <div className="flex items-start gap-3">
                  {alert.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />}
                  {alert.type === 'info' && <Info className="w-5 h-5 text-blue-500 mt-0.5" />}

                  <div className="flex-1">
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    {alert.amount && (
                      <p className="text-sm font-medium mt-2">
                        Monto relacionado: ${alert.amount.toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Recomendaciones</h2>
          </div>

          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}