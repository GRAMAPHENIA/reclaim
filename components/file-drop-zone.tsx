"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileArchive, Folder, FileText } from "lucide-react"
import { toast } from "sonner"
import JSZip from "jszip"
import { parseHealthJSON, calculateDailyAggregates } from "@/lib/health-data-parser"
import { healthStore } from "@/lib/health-store"

interface FileDropZoneProps {
  onFilesProcessed?: (count: number) => void
}

export function FileDropZone({ onFilesProcessed }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const processJSONFile = async (file: File, fileName?: string) => {
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      const rawMetrics = parseHealthJSON(jsonData)
      
      // Debug: Log heart rate data found
      const heartRateMetrics = rawMetrics.filter(m => m.heartRate !== undefined)
      const displayName = fileName || file.name
      console.log(`Archivo ${displayName}:`)
      console.log(`- Tipo de archivo: ${jsonData.type || 'Desconocido'}`)
      console.log(`- Tiene live_data: ${jsonData.live_data ? 'Sí (' + jsonData.live_data.length + ' puntos)' : 'No'}`)
      console.log(`- Total métricas: ${rawMetrics.length}`)
      console.log(`- Métricas de ritmo cardíaco: ${heartRateMetrics.length}`)
      if (heartRateMetrics.length > 0) {
        console.log('Primeras 3 métricas de ritmo cardíaco:', heartRateMetrics.slice(0, 3))
      }
      
      const aggregatedMetrics = calculateDailyAggregates(rawMetrics)
      const aggregatedHeartRate = aggregatedMetrics.filter(m => m.heartRate !== undefined)
      console.log(`- Métricas agregadas con ritmo cardíaco: ${aggregatedHeartRate.length}`)

      healthStore.addMetrics(aggregatedMetrics)
      
      // Show success notification for individual files
      if (aggregatedMetrics.length > 0) {
        toast.success(`Archivo procesado: ${displayName}`, {
          description: `${aggregatedMetrics.length} métricas agregadas`
        })
      }
      
      return aggregatedMetrics.length
    } catch (error) {
      console.error("Error processing file:", error)
      const displayName = fileName || file.name
      toast.error(`Error procesando ${displayName}`, {
        description: error instanceof Error ? error.message : "Error desconocido"
      })
      return 0
    }
  }

  const processZipFile = async (file: File) => {
    try {
      console.log(`Procesando archivo ZIP: ${file.name}`)
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)
      
      let totalProcessed = 0
      const jsonFiles = Object.keys(zipContent.files).filter(name => 
        name.endsWith('.json') && !zipContent.files[name].dir
      )
      
      console.log(`Encontrados ${jsonFiles.length} archivos JSON en el ZIP`)
      
      for (const fileName of jsonFiles) {
        try {
          const fileContent = await zipContent.files[fileName].async('text')
          const blob = new Blob([fileContent], { type: 'application/json' })
          const jsonFile = new File([blob], fileName, { type: 'application/json' })
          
          const processed = await processJSONFile(jsonFile, fileName)
          totalProcessed += processed
        } catch (error) {
          console.error(`Error procesando ${fileName} del ZIP:`, error)
        }
      }
      
      onFilesProcessed?.(totalProcessed)
      console.log(`ZIP procesado: ${totalProcessed} métricas totales`)
      
      if (totalProcessed > 0) {
        toast.success(`ZIP procesado exitosamente`, {
          description: `${jsonFiles.length} archivos procesados, ${totalProcessed} métricas agregadas`
        })
      } else {
        toast.warning(`ZIP procesado pero sin datos`, {
          description: `No se encontraron datos válidos en ${jsonFiles.length} archivos`
        })
      }
    } catch (error) {
      console.error("Error processing ZIP file:", error)
      toast.error(`Error procesando ZIP ${file.name}`, {
        description: error instanceof Error ? error.message : "Error desconocido"
      })
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
          
          if (entry.isFile && entry.name.endsWith('.json')) {
            try {
              console.log(`Procesando archivo JSON: ${entryPath}`)
              const file = await readFile(entry as FileSystemFileEntry)
              const processed = await processJSONFile(file, entryPath)
              totalProcessed += processed
            } catch (error) {
              console.error(`Error procesando ${entryPath}:`, error)
            }
          } else if (entry.isDirectory) {
            try {
              console.log(`Entrando en subcarpeta: ${entryPath}`)
              // Recursively process subdirectories
              const subEntries = await readDirectory(entry as FileSystemDirectoryEntry)
              await processEntries(subEntries, entryPath)
            } catch (error) {
              console.error(`Error procesando subcarpeta ${entryPath}:`, error)
            }
          } else if (entry.isFile) {
            console.log(`Archivo ignorado (no JSON): ${entryPath}`)
          }
        }
      }
      
      const entries = await readDirectory(dirEntry)
      await processEntries(entries, currentPath)
      
      onFilesProcessed?.(totalProcessed)
      console.log(`Carpeta ${currentPath} procesada: ${totalProcessed} métricas totales`)
      
      if (totalProcessed > 0) {
        toast.success(`Carpeta procesada exitosamente`, {
          description: `${totalProcessed} métricas agregadas desde ${currentPath}`
        })
      } else {
        toast.warning(`Carpeta procesada pero sin datos`, {
          description: `No se encontraron archivos JSON válidos en ${currentPath}`
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
          
          if (file.name.endsWith('.zip')) {
            await processZipFile(file)
            hasProcessedItems = true
          } else if (file.name.endsWith('.json')) {
            await processJSONFile(file)
            hasProcessedItems = true
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
          
          if (file.name.endsWith('.zip')) {
            await processZipFile(file)
          } else if (file.name.endsWith('.json')) {
            await processJSONFile(file)
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
      for (const file of files) {
        if (file.name.endsWith('.zip')) {
          await processZipFile(file)
        } else if (file.name.endsWith('.json')) {
          await processJSONFile(file)
        }
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
            <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {isProcessing ? "Procesando archivos..." : "Arrastra tus datos de salud aquí"}
        </h3>

        <div className="text-sm text-muted-foreground mb-4 space-y-2">
          <p>Soporta múltiples formatos:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Archivos JSON</span>
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
              accept=".json,.zip"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
            />
            <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isProcessing ? "Procesando..." : "Selecciona archivos"}
            </span>
          </label>
          
          <label className="cursor-pointer">
            <input
              type="file"
              // @ts-ignore - webkitdirectory is not in TypeScript types but is supported
              webkitdirectory=""
              multiple
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
            />
            <span className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50">
              {isProcessing ? "Procesando..." : "Selecciona carpeta"}
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
