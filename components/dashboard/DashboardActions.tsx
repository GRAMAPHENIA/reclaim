import { RotateCcw, Download, Trash2, FileText } from "lucide-react"

/**
 * Componente de acciones del dashboard
 * Responsabilidad: Botones de acción (limpiar filtros, exportar, borrar, facturas)
 */
interface DashboardActionsProps {
  onClearFilters: () => void
  onExport: () => void
  onClearData: () => void
  onOpenBilling: () => void
}

export function DashboardActions({
  onClearFilters,
  onExport,
  onClearData,
  onOpenBilling
}: DashboardActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        onClick={onClearFilters}
        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-muted transition-colors text-sm font-medium"
      >
        <RotateCcw className="w-4 h-4" />
        Limpiar filtros
      </button>
      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-muted transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Exportar CSV
      </button>
      <button
        onClick={onOpenBilling}
        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:bg-muted transition-colors text-sm font-medium"
      >
        <FileText className="w-4 h-4" />
        Facturas
      </button>
      <button
        onClick={onClearData}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Borrar datos
      </button>
    </div>
  )
}
