import { useState } from "react"
import { toast } from "sonner"
import { FileProcessorService } from "@/lib/services/file-processor.service"

/**
 * Hook personalizado para manejar importación de archivos
 * Responsabilidad: Gestionar estado y lógica de importación
 */
export function useFileImport(onFilesProcessed?: (count: number) => void) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  /**
   * Procesa archivos con manejo de errores y notificaciones
   */
  const processFiles = async (files: File[]): Promise<number> => {
    let totalProcessed = 0

    for (const file of files) {
      if (!FileProcessorService.isValidFileType(file)) {
        toast.warning(`Archivo no soportado: ${file.name}`, {
          description: "Solo se aceptan archivos CSV, JSON y ZIP de MercadoPago"
        })
        continue
      }

      try {
        const processed = await FileProcessorService.processFile(file)
        totalProcessed += processed

        if (processed > 0) {
          toast.success(`Archivo procesado: ${file.name}`, {
            description: `${processed} transacciones procesadas`
          })
        }
      } catch (error) {
        toast.error(`Error procesando ${file.name}`, {
          description: error instanceof Error ? error.message : "Error desconocido"
        })
      }
    }

    return totalProcessed
  }

  /**
   * Maneja el evento de drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * Maneja el evento de drag leave
   */
  const handleDragLeave = (e?: React.DragEvent) => {
    if (e && e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }
    setIsDragging(false)
  }

  /**
   * Maneja el evento de drop
   */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setIsProcessing(true)

    try {
      const items = Array.from(e.dataTransfer.items)
      let totalProcessed = 0
      let hasProcessedItems = false

      // Intentar procesar como directorios primero
      for (const item of items) {
        if (item.kind === 'file' && item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry()

          if (entry?.isDirectory) {
            const processed = await FileProcessorService.processDirectory(
              entry as FileSystemDirectoryEntry
            )
            totalProcessed += processed
            hasProcessedItems = true

            if (processed > 0) {
              toast.success(`Carpeta procesada: ${entry.name}`, {
                description: `${processed} transacciones procesadas`
              })
            }
            continue
          }
        }
      }

      // Fallback: procesar como archivos normales
      if (!hasProcessedItems) {
        const files = Array.from(e.dataTransfer.files)
        totalProcessed = await processFiles(files)
      }

      onFilesProcessed?.(totalProcessed)

      if (totalProcessed > 0) {
        toast.success(`Importación completada`, {
          description: `Se procesaron ${totalProcessed} transacciones en total`
        })
      }
    } catch (error) {
      console.error('Error en handleDrop:', error)
      toast.error("Error procesando archivos", {
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Maneja el input de archivos desde el selector
   */
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true)

    try {
      const files = Array.from(e.currentTarget.files || [])
      const totalProcessed = await processFiles(files)

      onFilesProcessed?.(totalProcessed)

      if (totalProcessed > 0) {
        toast.success(`Importación completada`, {
          description: `Se procesaron ${totalProcessed} transacciones en total`
        })
      }
    } catch (error) {
      console.error('Error en handleFileInput:', error)
      toast.error("Error procesando archivos", {
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    } finally {
      setIsProcessing(false)
      // Reset input
      e.target.value = ''
    }
  }

  return {
    isProcessing,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  }
}
