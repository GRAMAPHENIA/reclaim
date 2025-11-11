"use client"

import { FileText, Upload, ArrowDown } from "lucide-react"

/**
 * Componente de estado vacío
 * Responsabilidad: Mostrar mensaje cuando no hay datos cargados
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Icono principal */}
      <div className="relative mb-8">
        {/* Círculo de fondo */}
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-16 h-16 text-primary/60" strokeWidth={1.5} />
        </div>
        
        {/* Icono de upload flotante */}
        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Upload className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-2xl font-bold mb-3 text-center">
        No hay datos financieros
      </h2>

      {/* Descripción */}
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Importa tus datos de MercadoPago para comenzar a visualizar y analizar tus finanzas personales
      </p>

      {/* Indicador de barra flotante */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <ArrowDown className="w-5 h-5 animate-bounce" />
        <span>Usa la barra de importación en la parte inferior</span>
      </div>

      {/* Formatos soportados */}
      <div className="mt-12 pt-8 border-t border-border w-full max-w-2xl">
        <p className="text-sm font-medium text-center mb-4">Formatos soportados</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <FileText className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs font-medium">CSV</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <FileText className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs font-medium">JSON</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <FileText className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs font-medium">ZIP</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs font-medium">Carpetas</span>
          </div>
        </div>
      </div>

      {/* Instrucciones rápidas */}
      <div className="mt-8 p-6 rounded-lg bg-muted/30 max-w-2xl w-full">
        <h3 className="font-medium mb-3 text-sm">Cómo obtener tus datos:</h3>
        <ol className="text-sm text-muted-foreground space-y-2">
          <li className="flex gap-2">
            <span className="font-medium text-foreground">1.</span>
            <span>Ve a mercadopago.com.ar → Tu perfil → Privacidad</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">2.</span>
            <span>Solicita tu reporte de "Tus movimientos de dinero"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">3.</span>
            <span>Descarga el archivo cuando esté listo</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">4.</span>
            <span>Arrástralo a la barra de importación inferior</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
