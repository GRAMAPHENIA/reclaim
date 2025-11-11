// Parser para datos financieros de MercadoPago y otros servicios
import JSZip from 'jszip'

export interface FinancialTransaction {
  date: Date
  description: string
  amount: number
  type: 'credit' | 'debit'
  category: string
  paymentMethod: string
  status: 'approved' | 'pending' | 'rejected'
  reference: string
  rawData?: any
}

export interface FinancialSummary {
  totalCredits: number
  totalDebits: number
  netBalance: number
  transactionCount: number
  period: {
    start: Date
    end: Date
  }
  topCategories: Array<{
    category: string
    amount: number
    count: number
  }>
}

export interface ProcessedFinancialData {
  transactions: FinancialTransaction[]
  summary: FinancialSummary
}

// Categorías predefinidas para clasificación automática
const FINANCIAL_CATEGORIES = {
  // Ingresos
  'ingreso': ['cobro', 'pago recibido', 'transferencia recibida', 'depósito'],

  // Egresos por categoría
  'alimentos': ['supermercado', 'restaurante', 'delivery', 'pedidos ya', 'rappi', 'uber eats', 'glovo'],
  'transporte': ['uber', 'cabify', 'taxi', 'subte', 'colectivo', 'tren', 'estacionamiento'],
  'servicios': ['edenor', 'metrogas', 'telecom', 'claro', 'movistar', 'personal', 'fibertel', 'telecentro'],
  'entretenimiento': ['netflix', 'spotify', 'disney', 'amazon prime', 'cine', 'teatro', 'concierto'],
  'compras': ['amazon', 'mercadolibre', 'garbarino', 'fravega', 'musimundo', 'tienda'],
  'salud': ['farmacia', 'médico', 'odontólogo', 'hospital', 'obra social'],
  'educación': ['universidad', 'curso', 'libro', 'udemy', 'coursera'],
  'hogar': ['easy', 'home center', 'decoration', 'muebles'],
  'otros': []
}

// Función para clasificar automáticamente una transacción
function classifyTransaction(description: string, amount: number): string {
  const desc = description.toLowerCase()

  // Primero verificar ingresos
  for (const keyword of FINANCIAL_CATEGORIES.ingreso) {
    if (desc.includes(keyword)) {
      return 'Ingreso'
    }
  }

  // Luego verificar egresos por categoría
  for (const [category, keywords] of Object.entries(FINANCIAL_CATEGORIES)) {
    if (category !== 'ingreso' && category !== 'otros') {
      for (const keyword of keywords) {
        if (desc.includes(keyword)) {
          return category.charAt(0).toUpperCase() + category.slice(1)
        }
      }
    }
  }

  // Categoría por defecto
  return amount > 0 ? 'Ingreso' : 'Otros'
}

// Parser específico para CSV de MercadoPago
export function parseMercadoPagoCSV(csvText: string): FinancialTransaction[] {
  const transactions: FinancialTransaction[] = []
  const lines = csvText.split('\n').filter(line => line.trim())

  // Detectar si tiene headers
  const firstLine = lines[0]
  const hasHeaders = firstLine.toLowerCase().includes('fecha') || firstLine.toLowerCase().includes('date')

  const dataLines = hasHeaders ? lines.slice(1) : lines

  for (const line of dataLines) {
    if (!line.trim()) continue

    try {
      // MercadoPago CSV típico: fecha,descripcion,monto,tipo,estado,referencia
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim())

      if (columns.length < 4) continue

      const [dateStr, description, amountStr, type, status = 'approved', reference = ''] = columns

      // Parsear fecha (formato DD/MM/YYYY o YYYY-MM-DD)
      const date = parseDate(dateStr)
      if (!date) continue

      // Parsear monto (puede tener $ o comas)
      const amount = parseAmount(amountStr)
      if (amount === null) continue

      // En MercadoPago: valores positivos = ingresos, valores negativos = gastos
      const transactionType: 'credit' | 'debit' = amount >= 0 ? 'credit' : 'debit'

      // Clasificar automáticamente
      const category = classifyTransaction(description, amount)

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: transactionType,
        category,
        paymentMethod: 'MercadoPago',
        status: status.toLowerCase() as 'approved' | 'pending' | 'rejected',
        reference,
        rawData: { originalLine: line, columns }
      })
    } catch (error) {
      console.warn('Error parsing MercadoPago line:', line, error)
    }
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Función auxiliar para parsear fechas
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null

  try {
    // Intentar diferentes formatos
    const formats = [
      // DD/MM/YYYY
      (str: string) => {
        const [day, month, year] = str.split('/').map(Number)
        return new Date(year, month - 1, day)
      },
      // YYYY-MM-DD
      (str: string) => new Date(str),
      // DD-MM-YYYY
      (str: string) => {
        const [day, month, year] = str.split('-').map(Number)
        return new Date(year, month - 1, day)
      }
    ]

    for (const formatFn of formats) {
      const date = formatFn(dateStr)
      if (date && !isNaN(date.getTime())) {
        return date
      }
    }
  } catch (error) {
    console.warn('Error parsing date:', dateStr, error)
  }

  return null
}

// Función auxiliar para parsear montos
function parseAmount(amountStr: string): number | null {
  if (!amountStr) return null

  try {
    // Remover símbolos de moneda y espacios
    let cleanAmount = amountStr.replace(/[$\s]/g, '')

    // Manejar formato argentino con puntos como separadores de miles
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Ej: 1.234,56 -> 1234.56
      cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.')
    } else if (cleanAmount.includes(',')) {
      // Ej: 1234,56 -> 1234.56
      cleanAmount = cleanAmount.replace(',', '.')
    }

    const amount = parseFloat(cleanAmount)
    return isNaN(amount) ? null : amount
  } catch (error) {
    console.warn('Error parsing amount:', amountStr, error)
    return null
  }
}

// Procesar datos y calcular resumen
export function processFinancialData(transactions: FinancialTransaction[]): ProcessedFinancialData {
  if (!transactions.length) {
    return {
      transactions: [],
      summary: {
        totalCredits: 0,
        totalDebits: 0,
        netBalance: 0,
        transactionCount: 0,
        period: { start: new Date(), end: new Date() },
        topCategories: []
      }
    }
  }

  // Calcular totales
  const credits = transactions.filter(t => t.type === 'credit')
  const debits = transactions.filter(t => t.type === 'debit')

  const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalCredits - totalDebits

  // Periodo de las transacciones
  const dates = transactions.map(t => t.date.getTime())
  const period = {
    start: new Date(Math.min(...dates)),
    end: new Date(Math.max(...dates))
  }

  // Calcular top categorías
  const categoryStats = new Map<string, { amount: number, count: number }>()
  transactions.forEach(t => {
    const key = t.category
    const current = categoryStats.get(key) || { amount: 0, count: 0 }
    categoryStats.set(key, {
      amount: current.amount + (t.type === 'debit' ? t.amount : 0),
      count: current.count + 1
    })
  })

  const topCategories = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    transactions,
    summary: {
      totalCredits,
      totalDebits,
      netBalance,
      transactionCount: transactions.length,
      period,
      topCategories
    }
  }
}

// Parser específico para JSON de MercadoPago (formato del reporte oficial)
export function parseMercadoPagoJSON(jsonData: any[]): FinancialTransaction[] {
  const transactions: FinancialTransaction[] = []

  for (const item of jsonData) {
    try {
      const creationDate = parseDate(item.creation_date)
      if (!creationDate) continue

      // Parsear el valor (formato: "$ -1.234,56" o "$ 1.234,56")
      const valueStr = item.value || ''
      const amount = parseMercadoPagoAmount(valueStr)
      if (amount === null) continue

      // En MercadoPago: valores positivos = ingresos, valores negativos = gastos
      const transactionType: 'credit' | 'debit' = amount >= 0 ? 'credit' : 'debit'

      // Clasificar automáticamente basado en el título y tipo
      const category = classifyMercadoPagoTransaction(item.title, item.type, transactionType)

      transactions.push({
        date: creationDate,
        description: item.title || 'Sin descripción',
        amount: Math.abs(amount),
        type: transactionType,
        category,
        paymentMethod: 'MercadoPago',
        status: item.status || 'approved',
        reference: item.creation_date, // Usar fecha como referencia única
        rawData: item
      })
    } catch (error) {
      console.warn('Error parsing MercadoPago JSON item:', item, error)
    }
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Función auxiliar para parsear montos de MercadoPago (formato argentino)
function parseMercadoPagoAmount(valueStr: string): number | null {
  if (!valueStr || typeof valueStr !== 'string') return null

  try {
    // Remover símbolo de peso y espacios
    let cleanValue = valueStr.replace(/[$\s]/g, '')

    // Determinar si es positivo o negativo
    const isNegative = cleanValue.startsWith('-')
    if (isNegative) {
      cleanValue = cleanValue.substring(1)
    }

    // Convertir formato argentino: 1.234,56 -> 1234.56
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
    } else if (cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(',', '.')
    }

    const amount = parseFloat(cleanValue)
    if (isNaN(amount)) return null

    return isNegative ? -amount : amount
  } catch (error) {
    console.warn('Error parsing MercadoPago amount:', valueStr, error)
    return null
  }
}

// Clasificación específica para transacciones de MercadoPago
function classifyMercadoPagoTransaction(title: string, type: string, transactionType: 'credit' | 'debit'): string {
  const titleLower = title.toLowerCase()
  const typeLower = type.toLowerCase()

  // Clasificar ingresos
  if (transactionType === 'credit') {
    if (titleLower.includes('transferencia recibida') || typeLower.includes('cvu_movement') || typeLower.includes('collector')) {
      return 'Ingresos'
    }
    if (titleLower.includes('dinero retirado') || typeLower.includes('release')) {
      return 'Retiros'
    }
    if (titleLower.includes('dinero reservado') || typeLower.includes('fund')) {
      return 'Reservas'
    }
    return 'Ingresos'
  }

  // Clasificar egresos por tipo
  if (titleLower.includes('pago en tienda') || titleLower.includes('compra') || typeLower.includes('purchase')) {
    if (titleLower.includes('transporte') || titleLower.includes('carga de transporte')) {
      return 'Transporte'
    }
    return 'Compras'
  }

  if (titleLower.includes('transferencia enviada') || typeLower.includes('sender') || typeLower.includes('transfer_mo_payout_movement')) {
    return 'Transferencias'
  }

  if (titleLower.includes('dinero reservado') || typeLower.includes('fund')) {
    return 'Reservas'
  }

  // Fallback a categorías generales
  return classifyTransaction(title, transactionType === 'debit' ? -1000 : 1000)
}

// Función principal para procesar archivos financieros (soporta CSV, JSON y ZIP)
export function parseFinancialFile(file: File): Promise<ProcessedFinancialData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        if (file.name.toLowerCase().endsWith('.zip')) {
          // Procesar archivo ZIP
          const zip = new JSZip()
          const zipContent = await zip.loadAsync(e.target?.result as ArrayBuffer)
          const transactions: FinancialTransaction[] = []

          // Procesar cada archivo en el ZIP
          for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
            if (zipEntry.dir) continue // Saltar directorios

            const filenameLower = filename.toLowerCase()

            if (filenameLower.endsWith('.json')) {
              const content = await zipEntry.async('text')
              const jsonData = JSON.parse(content)
              
              if (Array.isArray(jsonData) && jsonData.length > 0) {
                // Detectar si es archivo de facturas o transacciones
                const firstItem = jsonData[0]
                
                if (firstItem.billing_concept !== undefined || firstItem.billing_date !== undefined) {
                  // Es un archivo de facturas - procesarlo en el store de facturas
                  try {
                    const { billingStore } = await import('./billing-store')
                    const { parseMercadoPagoBillingJSON } = await import('./billing-data-parser')
                    const invoices = parseMercadoPagoBillingJSON(jsonData)
                    if (invoices.length > 0) {
                      billingStore.addInvoices(invoices)
                    }
                  } catch (error) {
                    console.warn('Error processing billing data:', error)
                  }
                } else {
                  // Es un archivo de transacciones
                  transactions.push(...parseMercadoPagoJSON(jsonData))
                }
              }
            } else if (filenameLower.endsWith('.csv')) {
              const content = await zipEntry.async('text')
              transactions.push(...parseMercadoPagoCSV(content))
            }
          }

          if (transactions.length === 0) {
            reject(new Error('No se encontraron archivos CSV o JSON válidos en el archivo ZIP'))
            return
          }

          const processedData = processFinancialData(transactions)
          resolve(processedData)
          return
        }

        // Procesar archivos normales (no ZIP)
        const content = e.target?.result as string

        if (!content) {
          reject(new Error('Archivo vacío'))
          return
        }

        // Detectar tipo de archivo y parsear
        let transactions: FinancialTransaction[] = []

        if (file.name.toLowerCase().endsWith('.json')) {
          // Parsear como JSON de MercadoPago
          const jsonData = JSON.parse(content)
          if (Array.isArray(jsonData)) {
            transactions = parseMercadoPagoJSON(jsonData)
          } else {
            reject(new Error('El archivo JSON debe contener un array de transacciones'))
            return
          }
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          transactions = parseMercadoPagoCSV(content)
        } else {
          reject(new Error('Formato de archivo no soportado. Use CSV, JSON o ZIP de MercadoPago.'))
          return
        }

        if (transactions.length === 0) {
          reject(new Error('No se encontraron transacciones válidas en el archivo'))
          return
        }

        const processedData = processFinancialData(transactions)
        resolve(processedData)

      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Error leyendo el archivo'))

    // Leer como ArrayBuffer para ZIP, como texto para otros archivos
    if (file.name.toLowerCase().endsWith('.zip')) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  })
}