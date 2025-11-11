import type { FinancialTransaction, ProcessedFinancialData } from "@/lib/financial-data-parser"

/**
 * Interfaces para stores de datos
 * Responsabilidad: Definir contratos para gestión de estado
 */

/**
 * Listener para cambios en el store
 */
export type StoreListener = () => void

/**
 * Interface base para stores
 */
export interface IDataStore<T> {
  /**
   * Suscribe un listener a cambios
   */
  subscribe(listener: StoreListener): () => void

  /**
   * Obtiene todos los datos
   */
  getData(): T | null

  /**
   * Limpia todos los datos
   */
  clearData(): void
}

/**
 * Interface para store de transacciones financieras
 */
export interface IFinancialStore extends IDataStore<ProcessedFinancialData> {
  /**
   * Agrega datos financieros
   */
  addFinancialData(data: ProcessedFinancialData): void

  /**
   * Obtiene todas las transacciones
   */
  getTransactions(): FinancialTransaction[]

  /**
   * Obtiene transacciones en un rango de fechas
   */
  getTransactionsInRange(startDate: Date, endDate: Date): FinancialTransaction[]

  /**
   * Obtiene transacciones por categoría
   */
  getTransactionsByCategory(category: string): FinancialTransaction[]

  /**
   * Obtiene resumen mensual
   */
  getMonthlySummary(): Array<{
    month: string
    year: number
    credits: number
    debits: number
    net: number
    transactionCount: number
  }>

  /**
   * Obtiene estadísticas rápidas
   */
  getQuickStats(): {
    totalBalance: number
    currentMonthCredits: number
    currentMonthDebits: number
    currentMonthNet: number
    totalTransactions: number
    currentMonthTransactions: number
  } | null
}

/**
 * Opciones de filtrado
 */
export interface FilterOptions {
  startDate?: Date
  endDate?: Date
  category?: string
  type?: 'credit' | 'debit'
  minAmount?: number
  maxAmount?: number
  status?: 'approved' | 'pending' | 'rejected'
  searchTerm?: string
}

/**
 * Interface extendida con filtros
 */
export interface IFilterableStore extends IFinancialStore {
  /**
   * Filtra transacciones según opciones
   */
  filterTransactions(options: FilterOptions): FinancialTransaction[]

  /**
   * Busca transacciones por término
   */
  searchTransactions(term: string): FinancialTransaction[]
}

/**
 * Interface para store con persistencia
 */
export interface IPersistentStore extends IFinancialStore {
  /**
   * Guarda datos en localStorage
   */
  persist(): void

  /**
   * Carga datos desde localStorage
   */
  restore(): void

  /**
   * Verifica si hay datos persistidos
   */
  hasPersisted(): boolean
}

/**
 * Configuración del store
 */
export interface StoreConfig {
  /**
   * Habilitar persistencia
   */
  enablePersistence?: boolean

  /**
   * Clave para localStorage
   */
  storageKey?: string

  /**
   * Límite de transacciones en memoria
   */
  maxTransactions?: number

  /**
   * Auto-limpiar datos antiguos
   */
  autoCleanOldData?: boolean

  /**
   * Días para considerar datos antiguos
   */
  oldDataThresholdDays?: number
}
