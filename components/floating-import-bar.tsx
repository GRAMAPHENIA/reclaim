"use client"

import { useState } from "react"
import { Upload, FileArchive, Folder, FileText, Paperclip, Plus } from "lucide-react"
import { toast } from "sonner"
import JSZip from "jszip"
import { parseHealthJSON, calculateDailyAggregates } from "@/lib/health-data-parser"
import { healthStore } from "@/lib/health-store"

interface FloatingImportBarProps {
  onFilesProcessed?: (count: number) => void
}

export function FloatingImportBar({ onFilesProcessed }: FloatingImportBarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const processJSONFile = async (file: File, fileName?: string) => {
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      const rawMetrics = parseHealthJSON(jsonData)
      
      const heartRateMetrics = rawMetrics.filter(m => m.heartRate !== undefined)
      const displayName = fileName || file.name
      console.log(`Archivo ${displayName}:`)
      console.log(`- Tipo de archivo: ${jsonData.type || 'Desconocido'}`)
      console.log(`- Tiene live_data: ${jsonData.live_data ? 'Sí (' + jsonData.live_data.length + ' puntos)' : 'No'}`)
      console.log(`- Total métricas: ${rawMetrics.length}`)
      console.log(`- Métricas de ritmo cardíaco: ${heartRateMetrics.length}`)
      
      const aggregatedMetrics = calculateDailyAggregates(rawMetrics)
      const aggregatedHeartRate = aggregatedMetrics.filter(m => m.heartRate !== undefined)
      console.log(`- Métricas agregadas con ritmo cardíaco: ${aggregatedHeartRate.length}`)

      healthStore.addMetrics(aggregatedMetrics)
      
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
          const allEntries: FileSystemEntry[] = []
          
          const readBatch = () => {
            reader.readEntries((entries) => {
              if (entries.length === 0) {
                resolve(allEntries)
              } else {
                allEntries.push(...entries)
                readBatch()
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
              const subEntries = await readDirectory(entry as FileSystemDirectoryEntry)
              await processEntries(subEntries, entryPath)
            } catch (error) {
              console.error(`Error procesando subcarpeta ${entryPath}:`, error)
            }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragging to false if we're leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
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
        if (item.kind === 'file') {
          if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry()
            
            if (entry?.isDirectory) {
              console.log(`Procesando carpeta: ${entry.name}`)
              await processDirectory(entry as FileSystemDirectoryEntry)
              hasProcessedItems = true
              continue
            }
          }
          
          const file = item.getAsFile()
          if (!file) continue
          
          if (file.name.endsWith('.zip')) {
            await processZipFile(file)
            hasProcessedItems = true
          } else if (file.name.endsWith('.json')) {
            await processJSONFile(file)
            hasProcessedItems = true
          }
        }
      }
      
      if (!hasProcessedItems) {
        const files = Array.from(e.dataTransfer.files)
        for (const file of files) {
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
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-4xl mx-auto p-4">
        <div 
          className={`relative border transition-all ${
            isDragging 
              ? "border-primary bg-primary/5 shadow-lg" 
              : "border-border bg-card shadow-sm hover:shadow-md"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Main Input Area */}
          <div className="flex items-center gap-3 p-4">
            {/* Attachment Button */}
            <div className="flex gap-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".json,.zip"
                  onChange={handleFileInput}
                  disabled={isProcessing}
                  className="hidden"
                />
                <div className="p-2 hover:bg-muted transition-colors">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </div>
              </label>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  multiple
                  onChange={handleFileInput}
                  disabled={isProcessing}
                  className="hidden"
                />
                <div className="p-2 hover:bg-muted transition-colors">
                  <Folder className="w-5 h-5 text-muted-foreground" />
                </div>
              </label>
            </div>

            {/* Input Area */}
            <div className="flex-1 min-h-[48px] flex items-center px-4 py-3 bg-muted/50">
              {isProcessing ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Procesando archivos...</span>
                </div>
              ) : isDragging ? (
                <div className="flex items-center gap-3 text-primary">
                  <Upload className="w-4 h-4" />
                  <span>Suelta tus archivos aquí</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  <span>Arrastra archivos JSON, ZIP o carpetas aquí, o usa los botones</span>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              disabled={isProcessing}
              className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* File Type Indicators */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>JSON</span>
              </div>
              <div className="flex items-center gap-1">
                <FileArchive className="w-3 h-3" />
                <span>ZIP</span>
              </div>
              <div className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>Carpetas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}