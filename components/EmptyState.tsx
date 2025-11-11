"use client"

import { FileText, Upload, ArrowDown } from "lucide-react"

/**
 * Componente de estado vacío minimalista
 * Responsabilidad: Mostrar mensaje simple cuando no hay datos cargados
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-240px)]">
      {/* Icono principal */}
      <div className="relative mb-6">
        {/* Círculo de fondo */}
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-12 h-12 text-primary/60" strokeWidth={1.5} />
        </div>
        
        {/* Icono de upload flotante */}
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Upload className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-xl font-bold mb-2 text-center">
        No hay datos financieros
      </h2>

      {/* Descripción minimalista */}
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        Importa tus datos de MercadoPago para comenzar
      </p>

      {/* Indicador de barra flotante */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowDown className="w-4 h-4 animate-bounce" />
        <span>Usa la barra de importación inferior</span>
      </div>
    </div>
  )
}
