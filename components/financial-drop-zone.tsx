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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setIsProcessing(true)

    try {
      const files = Array.from(e.dataTransfer.files)
      console.log(`Archivos arrastrados: ${files.length}`)

      let totalProcessed = 0

      for (const file of files) {
        console.log(`Procesando archivo: ${file.name}, tipo: ${file.type}, tamaño: ${file.size}`)

        if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.zip')) {
          const processed = await processFinancialFile(file)
          totalProcessed += processed
        } else {
          toast.warning(`Archivo no soportado: ${file.name}`, {
            description: "Solo se aceptan archivos CSV, JSON y ZIP de MercadoPago"
          })
        }
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