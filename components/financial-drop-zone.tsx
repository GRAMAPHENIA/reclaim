"use client"

import { Upload, FileText, DollarSign, FileArchive, Folder } from "lucide-react"
import { useFileImport } from "@/hooks/useFileImport"

/**
 * Componente de zona de arrastre para importar archivos financieros
 * Responsabilidad: UI de importación inicial (pantalla vacía)
 */
interface FinancialDropZoneProps {
  onFilesProcessed?: (count: number) => void
}

export function FinancialDropZone({ onFilesProcessed }: FinancialDropZoneProps) {
  const {
    isProcessing,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  } = useFileImport(onFilesProcessed)

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed transition-all ${
        isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className={`rounded-full p-4 mb-4 ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
          {isProcessing ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <DollarSign className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {isProcessing ? "Procesando datos financieros..." : "Arrastra tus datos de MercadoPago aquí"}
        </h3>

        <div className="text-sm text-muted-foreground mb-4 space-y-2">
          <p>Importa tus datos financieros de MercadoPago</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Archivos JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Archivos CSV</span>
            </div>
            <div className="flex items-center gap-2">
              <FileArchive className="w-4 h-4" />
              <span>Archivos ZIP</span>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span>Carpetas completas</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".csv,.json,.zip"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
            />
            <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isProcessing ? "Procesando..." : "Seleccionar archivos"}
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
