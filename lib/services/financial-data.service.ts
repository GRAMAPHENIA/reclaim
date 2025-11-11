import { financialStore } from "@/lib/financial-store"

/**
 * Servicio para operaciones de datos financieros
 * Responsabilidad: Manejar operaciones CRUD y lógica de negocio
 */
export class FinancialDataService {
  /**
   * Limpia todos los datos financieros
   */
  static clearAllData(): void {
    financialStore.clearFinancialData()
  }

  /**
   * Obtiene todas las transacciones
   */
  static getAllTransactions() {
    return financialStore.getTransactions()
  }

  /**
   * Obtiene transacciones en un rango de fechas
   */
  static getTransactionsInRange(startDate: Date, endDate: Date) {
    return financialStore.getTransactionsInRange(startDate, endDate)
  }

  /**
   * Obtiene transacciones por categoría
   */
  static getTransactionsByCategory(category: string) {
    return financialStore.getTransactionsByCategory(category)
  }

  /**
   * Obtiene resumen mensual
   */
  static getMonthlySummary() {
    return financialStore.getMonthlySummary()
  }

  /**
   * Obtiene estadísticas rápidas
   */
  static getQuickStats() {
    return financialStore.getQuickStats()
  }
}
