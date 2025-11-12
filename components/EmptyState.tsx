"use client"

import { FileText, Upload, ArrowDown } from "lucide-react"

/**
 * Componente de estado vacío minimalista
 * Responsabilidad: Mostrar mensaje simple cuando no hay datos cargados
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] px-4">
      {/* Icono principal */}
      <div className="relative mb-4 sm:mb-6">
        {/* Círculo de fondo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" strokeWidth={1.5} />
        </div>
        
        {/* Icono de upload flotante */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-center">
        No hay datos financieros
      </h2>

      {/* Descripción minimalista */}
      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md mb-4 sm:mb-6 px-4">
        Importa tus datos de MercadoPago para comenzar
      </p>

      {/* Indicador de barra flotante - Solo en desktop */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowDown className="w-4 h-4 animate-bounce" />
        <span>Usa la barra de importación inferior</span>
      </div>

      {/* Botón de importación para mobile */}
      <div className="flex sm:hidden items-center gap-2 text-xs text-muted-foreground">
        <ArrowDown className="w-3 h-3 animate-bounce" />
        <span>Toca "Importar" abajo</span>
      </div>
    </div>
  )
}
