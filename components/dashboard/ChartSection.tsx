import { useState } from "react"
import { FinancialChart } from "@/components/financial-chart"
import type { FinancialTransaction } from "@/lib/financial-data-parser"

/**
 * Componente de sección de gráficos
 * Responsabilidad: Mostrar gráficos con selector de tipo
 */
interface ChartSectionProps {
  transactions: FinancialTransaction[]
}

export function ChartSection({ transactions }: ChartSectionProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Evolución Financiera</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'bar' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}
          >
            Barras
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded ${
              chartType === 'line' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}
          >
            Línea
          </button>
        </div>
      </div>
      <FinancialChart transactions={transactions} type={chartType} />
    </div>
  )
}
