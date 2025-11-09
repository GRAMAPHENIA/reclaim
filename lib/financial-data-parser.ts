// Parser para datos financieros de MercadoPago y otros servicios

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

      // Determinar tipo basado en el monto y descripción
      const transactionType: 'credit' | 'debit' = amount > 0 ? 'credit' : 'debit'

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

// Función principal para procesar archivos financieros
export function parseFinancialFile(file: File): Promise<ProcessedFinancialData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string

        if (!content) {
          reject(new Error('Archivo vacío'))
          return
        }

        // Detectar tipo de archivo y parsear
        let transactions: FinancialTransaction[] = []

        if (file.name.toLowerCase().endsWith('.csv')) {
          transactions = parseMercadoPagoCSV(content)
        } else {
          reject(new Error('Formato de archivo no soportado. Use CSV.'))
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
    reader.readAsText(file)
  })
}