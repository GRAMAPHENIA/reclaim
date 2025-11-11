// Parser para facturas de MercadoPago

export interface BillingInvoice {
  billingConcept: string
  billingDate: Date
  billingType: string
  referenceNumber: string
  siteId: string | null
  total: number
}

export interface ProcessedBillingData {
  invoices: BillingInvoice[]
  totalAmount: number
  invoiceCount: number
}

// Parser para JSON de facturas de MercadoPago
export function parseMercadoPagoBillingJSON(jsonData: any[]): BillingInvoice[] {
  const invoices: BillingInvoice[] = []

  for (const item of jsonData) {
    try {
      const billingDate = new Date(item.billing_date)
      if (!billingDate || isNaN(billingDate.getTime())) continue

      invoices.push({
        billingConcept: item.billing_concept || 'Sin concepto',
        billingDate,
        billingType: item.billing_type || 'BILL',
        referenceNumber: item.reference_number || '',
        siteId: item.site_id,
        total: item.total || 0
      })
    } catch (error) {
      console.warn('Error parsing billing item:', item, error)
    }
  }

  return invoices.sort((a, b) => b.billingDate.getTime() - a.billingDate.getTime())
}

// Procesar datos de facturas
export function processBillingData(invoices: BillingInvoice[]): ProcessedBillingData {
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)

  return {
    invoices,
    totalAmount,
    invoiceCount: invoices.length
  }
}

// Función para procesar archivo de facturas
export function parseBillingFile(file: File): Promise<ProcessedBillingData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (!content) {
          reject(new Error('Archivo vacío'))
          return
        }

        const jsonData = JSON.parse(content)
        if (!Array.isArray(jsonData)) {
          reject(new Error('El archivo JSON debe contener un array de facturas'))
          return
        }

        const invoices = parseMercadoPagoBillingJSON(jsonData)
        if (invoices.length === 0) {
          reject(new Error('No se encontraron facturas válidas en el archivo'))
          return
        }

        const processedData = processBillingData(invoices)
        resolve(processedData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.readAsText(file)
  })
}
