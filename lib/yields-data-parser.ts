// Parser para rendimientos de inversiones de MercadoPago

export interface YieldEntry {
  amount: number
  description: string
  date: Date
  partialBalance: number
}

export interface ProcessedYieldsData {
  yields: YieldEntry[]
  totalYields: number
  averageYield: number
  yieldCount: number
  period: {
    start: Date
    end: Date
  }
  monthlyYields: Map<string, number>
}

// Parser para JSON de rendimientos de MercadoPago
export function parseMercadoPagoYieldsJSON(jsonData: any[]): YieldEntry[] {
  const yields: YieldEntry[] = []

  for (const item of jsonData) {
    try {
      const date = new Date(item.ledger_datetime)
      if (!date || isNaN(date.getTime())) continue

      // Parsear monto (formato: "ARS 355,71")
      const amount = parseYieldAmount(item.amount)
      if (amount === null) continue

      // Parsear balance parcial
      const partialBalance = parseYieldAmount(item.partial_balance)
      if (partialBalance === null) continue

      yields.push({
        amount,
        description: item.description || 'Rendimiento',
        date,
        partialBalance
      })
    } catch (error) {
      console.warn('Error parsing yield item:', item, error)
    }
  }

  return yields.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Función auxiliar para parsear montos de rendimientos
function parseYieldAmount(amountStr: string): number | null {
  if (!amountStr || typeof amountStr !== 'string') return null

  try {
    // Remover "ARS" y espacios
    let cleanAmount = amountStr.replace(/ARS\s*/gi, '').trim()

    // Convertir formato argentino: 355,71 -> 355.71
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Formato: 1.234,56 -> 1234.56
      cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.')
    } else if (cleanAmount.includes(',')) {
      // Formato: 355,71 -> 355.71
      cleanAmount = cleanAmount.replace(',', '.')
    }

    const amount = parseFloat(cleanAmount)
    return isNaN(amount) ? null : amount
  } catch (error) {
    console.warn('Error parsing yield amount:', amountStr, error)
    return null
  }
}

// Procesar datos de rendimientos
export function processYieldsData(yields: YieldEntry[]): ProcessedYieldsData {
  if (!yields.length) {
    return {
      yields: [],
      totalYields: 0,
      averageYield: 0,
      yieldCount: 0,
      period: { start: new Date(), end: new Date() },
      monthlyYields: new Map()
    }
  }

  const totalYields = yields.reduce((sum, y) => sum + y.amount, 0)
  const averageYield = totalYields / yields.length

  // Periodo
  const dates = yields.map(y => y.date.getTime())
  const period = {
    start: new Date(Math.min(...dates)),
    end: new Date(Math.max(...dates))
  }

  // Agrupar por mes
  const monthlyYields = new Map<string, number>()
  yields.forEach(y => {
    const monthKey = `${y.date.getFullYear()}-${String(y.date.getMonth() + 1).padStart(2, '0')}`
    const current = monthlyYields.get(monthKey) || 0
    monthlyYields.set(monthKey, current + y.amount)
  })

  return {
    yields,
    totalYields,
    averageYield,
    yieldCount: yields.length,
    period,
    monthlyYields
  }
}

// Función para procesar archivo de rendimientos
export function parseYieldsFile(file: File): Promise<ProcessedYieldsData> {
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
          reject(new Error('El archivo JSON debe contener un array de rendimientos'))
          return
        }

        const yields = parseMercadoPagoYieldsJSON(jsonData)
        if (yields.length === 0) {
          reject(new Error('No se encontraron rendimientos válidos en el archivo'))
          return
        }

        const processedData = processYieldsData(yields)
        resolve(processedData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.readAsText(file)
  })
}
