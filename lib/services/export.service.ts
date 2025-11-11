import type { FinancialTransaction } from "@/lib/financial-data-parser"

/**
 * Servicio para exportación de datos
 * Responsabilidad: Manejar la exportación de datos a diferentes formatos
 */
export class ExportService {
  /**
   * Exporta transacciones a formato CSV
   */
  static exportToCSV(transactions: FinancialTransaction[], filename?: string): void {
    if (!transactions.length) {
      throw new Error("No hay datos para exportar")
    }

    const csvContent = this.generateCSVContent(transactions)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    this.downloadFile(blob, filename || this.generateFilename())
  }

  /**
   * Genera el contenido CSV
   */
  private static generateCSVContent(transactions: FinancialTransaction[]): string {
    const headers = ["Fecha", "Descripción", "Monto", "Tipo", "Categoría", "Método de Pago", "Estado", "Referencia"]
    
    const rows = transactions.map(t => [
      t.date.toISOString().split('T')[0],
      this.escapeCSVField(t.description),
      t.amount.toString(),
      t.type,
      t.category,
      t.paymentMethod,
      t.status,
      t.reference
    ])

    return [headers, ...rows]
      .map(row => row.join(","))
      .join("\n")
  }

  /**
   * Escapa campos CSV que contienen comas o comillas
   */
  private static escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }

  /**
   * Genera nombre de archivo con timestamp
   */
  private static generateFilename(): string {
    const date = new Date().toISOString().split('T')[0]
    return `reclaim-finanzas-${date}.csv`
  }

  /**
   * Descarga un archivo blob
   */
  private static downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar URL
    URL.revokeObjectURL(url)
  }
}
