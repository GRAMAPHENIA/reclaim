"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, DollarSign, FileArchive, Folder } from "lucide-react"
import { toast } from "sonner"
import { parseFinancialFile } from "@/lib/financial-data-parser"
import { financialStore } from "@/lib/financial-store"

interface FinancialDropZoneProps {
  onFilesProcessed?: (count: number) => void
}

export function FinancialDropZone({ onFilesProcessed }: FinancialDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const processFinancialFile = async (file: File) => {
    try {
      console.log(`Procesando archivo financiero: ${file.name}`)
      const processedData = await parseFinancialFile(file)

      console.log(`Archivo procesado: ${processedData.transactions.length} transacciones`)
      console.log(`Período: ${processedData.summary.period.start.toLocaleDateString()} - ${processedData.summary.period.end.toLocaleDateString()}`)
      console.log(`Saldo neto: $${processedData.summary.netBalance.toFixed(2)}`)

      financialStore.addFinancialData(processedData)

      // Notificación de éxito
      toast.success(`Datos financieros importados`, {
        description: `${processedData.transactions.length} transacciones procesadas`
      })

      return processedData.transactions.length
    } catch (error) {
      console.error("Error procesando archivo financiero:", error)
      toast.error(`Error procesando ${file.name}`, {
        description: error instanceof Error ? error.message : "Error desconocido"
      })
      return 0
    }
  }

  const processDirectory = async (dirEntry: FileSystemDirectoryEntry, path: string = '') => {
    try {
      const currentPath = path ? `${path}/${dirEntry.name}` : dirEntry.name
      console.log(`Procesando carpeta: ${currentPath}`)
      let totalProcessed = 0

      const readDirectory = (entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> => {
        return new Promise((resolve, reject) => {
          const reader = entry.createReader()

          // Read all entries (some browsers require multiple calls)
          const allEntries: FileSystemEntry[] = []

          const readBatch = () => {
            reader.readEntries((entries) => {
              if (entries.length === 0) {
                // No more entries
                resolve(allEntries)
              } else {
                allEntries.push(...entries)
                readBatch() // Read next batch
              }
            }, reject)
          }

          readBatch()
        })
      }

      const readFile = (fileEntry: FileSystemFileEntry): Promise<File> => {
        return new Promise((resolve, reject) => {
          fileEntry.file(resolve, reject)
        })
      }

      const processEntries = async (entries: FileSystemEntry[], currentPath: string) => {
        console.log(`Encontradas ${entries.length} entradas en ${currentPath}`)

        for (const entry of entries) {
          const entryPath = `${currentPath}/${entry.name}`

          if (entry.isFile && (entry.name.toLowerCase().endsWith('.csv') || entry.name.toLowerCase().endsWith('.json') || entry.name.toLowerCase().endsWith('.zip'))) {
            try {
              console.log(`Procesando archivo financiero: ${entryPath}`)
              const file = await readFile(entry as FileSystemFileEntry)
              const processed = await processFinancialFile(file)
              totalProcessed += processed
            } catch (error) {
              console.error(`Error procesando ${entryPath}:`, error)
            }
          } else if (entry.isDirectory) {
            try {
              console.log(`Entrando en subcarpeta: ${entryPath}`)
              // Recursively process subdirectories
              const subEntries = await readDirectory(entry as FileSystemDirectoryEntry)
              const subProcessed = await processEntries(subEntries, entryPath)
              totalProcessed += subProcessed
            } catch (error) {
              console.error(`Error procesando subcarpeta ${entryPath}:`, error)
            }
          } else if (entry.isFile) {
            console.log(`Archivo ignorado (no soportado): ${entryPath}`)
          }
        }

        return totalProcessed
      }

      const entries = await readDirectory(dirEntry)
      const processed = await processEntries(entries, currentPath)

      onFilesProcessed?.(processed)
      console.log(`Carpeta ${currentPath} procesada: ${processed} transacciones totales`)

      if (processed > 0) {
        toast.success(`Carpeta procesada exitosamente`, {
          description: `${processed} transacciones agregadas desde ${currentPath}`
        })
      } else {
        toast.warning(`Carpeta procesada pero sin datos`, {
          description: `No se encontraron archivos CSV, JSON o ZIP válidos en ${currentPath}`
        })
      }
    } catch (error) {
      console.error("Error processing directory:", error)
      toast.error(`Error procesando carpeta ${dirEntry.name}`, {
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setIsProcessing(true)

    try {
      const items = Array.from(e.dataTransfer.items)
      console.log(`Elementos arrastrados: ${items.length}`)

      let hasProcessedItems = false

      for (const item of items) {
        console.log(`Procesando item: kind=${item.kind}, type=${item.type}`)

        if (item.kind === 'file') {
          // Check if it's a directory using webkitGetAsEntry
          if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry()
            console.log(`Entry: ${entry?.name}, isDirectory: ${entry?.isDirectory}, isFile: ${entry?.isFile}`)

            if (entry?.isDirectory) {
              console.log(`Procesando carpeta: ${entry.name}`)
              await processDirectory(entry as FileSystemDirectoryEntry)
              hasProcessedItems = true
              continue
            }
          }

          // Handle regular files
          const file = item.getAsFile()
          if (!file) continue

          console.log(`Procesando archivo: ${file.name}`)

          if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.zip')) {
            await processFinancialFile(file)
            hasProcessedItems = true
          } else {
            toast.warning(`Archivo no soportado: ${file.name}`, {
              description: "Solo se aceptan archivos CSV, JSON y ZIP de MercadoPago"
            })
          }
        }
      }

      // Fallback for browsers that don't support webkitGetAsEntry or if no items were processed
      if (!hasProcessedItems) {
        console.log('Usando fallback con dataTransfer.files')
        const files = Array.from(e.dataTransfer.files)
        console.log(`Archivos en fallback: ${files.length}`)

        for (const file of files) {
          console.log(`Procesando archivo fallback: ${file.name}, size: ${file.size}`)

          if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.zip')) {
            await processFinancialFile(file)
          }
        }
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

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true)
    try {
      const files = Array.from(e.currentTarget.files || [])
      let totalProcessed = 0

      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.zip')) {
          const processed = await processFinancialFile(file)
          totalProcessed += processed
        } else {
          toast.warning(`Archivo no soportado: ${file.name}`)
        }
      }

      onFilesProcessed?.(totalProcessed)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDirectoryInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true)
    try {
      const files = Array.from(e.currentTarget.files || [])
      let totalProcessed = 0

      // Group files by their webkitRelativePath to reconstruct directory structure
      const filesByPath: Record<string, File[]> = {}

      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.zip')) {
          const path = (file as any).webkitRelativePath || file.name
          const dirPath = path.substring(0, path.lastIndexOf('/'))

          if (!filesByPath[dirPath]) {
            filesByPath[dirPath] = []
          }
          filesByPath[dirPath].push(file)
        }
      }

      // Process files from each directory
      for (const [dirPath, dirFiles] of Object.entries(filesByPath)) {
        console.log(`Procesando carpeta: ${dirPath} (${dirFiles.length} archivos)`)

        for (const file of dirFiles) {
          const processed = await processFinancialFile(file)
          totalProcessed += processed
        }

        if (dirFiles.length > 0) {
          toast.success(`Carpeta procesada: ${dirPath}`, {
            description: `${dirFiles.length} archivos procesados`
          })
        }
      }

      onFilesProcessed?.(totalProcessed)

      if (totalProcessed > 0) {
        toast.success(`Importación completada`, {
          description: `Se procesaron ${totalProcessed} transacciones en total`
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

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

          <label className="cursor-pointer">
            <input
              type="file"
              // @ts-ignore - webkitdirectory is not in TypeScript types but is supported
              webkitdirectory=""
              multiple
              onChange={handleDirectoryInput}
              disabled={isProcessing}
              className="hidden"
            />
            <span className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50">
              {isProcessing ? "Procesando..." : "Seleccionar carpeta"}
            </span>
          </label>
        </div>

      </div>
    </div>
  )
}