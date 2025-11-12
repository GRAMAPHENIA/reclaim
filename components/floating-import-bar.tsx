"use client"

import { Upload, FileArchive, Folder, FileText, Paperclip, Plus, HelpCircle } from "lucide-react"
import { useFileImport } from "@/hooks/useFileImport"
import { MobileFooter } from "@/components/MobileFooter"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Componente de barra flotante para importar archivos
 * Responsabilidad: UI de importación persistente (cuando hay datos)
 */
interface FloatingImportBarProps {
  onFilesProcessed?: (count: number) => void
}

export function FloatingImportBar({ onFilesProcessed }: FloatingImportBarProps) {
  const {
    isProcessing,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  } = useFileImport(onFilesProcessed)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-4xl mx-auto p-4">
        <div 
          className={`relative border transition-all ${
            isDragging 
              ? "border-primary bg-primary/10 shadow-xl ring-2 ring-primary/20" 
              : "border-border bg-card shadow-sm hover:shadow-md"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Glassmorphism Overlay for Drag State */}
          {isDragging && (
            <div className="absolute inset-0 bg-white/70 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Main Input Area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 sm:p-4">
            {/* Attachment Buttons */}
            <div className="flex gap-1 justify-center sm:justify-start">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".csv,.json,.zip"
                        onChange={handleFileInput}
                        disabled={isProcessing}
                        className="hidden"
                      />
                      <div className="p-2 hover:bg-muted transition-colors rounded">
                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Seleccionar archivos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        // @ts-ignore - webkitdirectory no está en tipos pero es soportado
                        webkitdirectory=""
                        multiple
                        onChange={handleFileInput}
                        disabled={isProcessing}
                        className="hidden"
                      />
                      <div className="p-2 hover:bg-muted transition-colors rounded">
                        <Folder className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Seleccionar carpeta</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Input Area */}
            <div className="flex-1 min-h-[48px] flex items-center px-3 sm:px-4 py-3 bg-muted/50 rounded">
              {isProcessing ? (
                <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="hidden sm:inline">Procesando archivos...</span>
                  <span className="sm:hidden">Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">Arrastra archivos CSV, JSON, ZIP o carpetas aquí, o usa los botones</span>
                  <span className="hidden sm:inline md:hidden">Arrastra archivos o usa los botones</span>
                  <span className="sm:hidden">Arrastra o selecciona archivos</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              disabled={isProcessing}
              className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 rounded"
              title="Importar archivos"
            >
              {isProcessing ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* File Type Indicators with Help */}
          <div className="px-3 sm:px-4 pb-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap justify-center sm:justify-start">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <FileText className="w-3 h-3" />
                        <span>CSV</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archivos CSV de MercadoPago</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <FileText className="w-3 h-3" />
                        <span>JSON</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archivos JSON del reporte oficial</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <FileArchive className="w-3 h-3" />
                        <span>ZIP</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archivos ZIP con múltiples archivos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <Folder className="w-3 h-3" />
                        <span>Carpetas</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Carpetas completas con archivos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Help Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="p-1 hover:bg-muted rounded transition-colors" 
                    aria-label="Ayuda"
                    suppressHydrationWarning
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end" suppressHydrationWarning>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Cómo obtener tus datos</h4>
                    <ol className="text-xs text-muted-foreground space-y-2">
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">1.</span>
                        <span>Ve a mercadopago.com.ar → Tu perfil → Privacidad</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">2.</span>
                        <span>Solicita "Tus movimientos de dinero"</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">3.</span>
                        <span>Descarga el archivo cuando esté listo</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">4.</span>
                        <span>Arrástralo aquí o usa los botones</span>
                      </li>
                    </ol>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Footer integrado para mobile - aparece debajo de la barra */}
        <MobileFooter />
      </div>
    </div>
  )
}
