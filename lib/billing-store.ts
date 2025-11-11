// Store para gestionar facturas
import type { BillingInvoice } from './billing-data-parser'

class BillingStore {
  private invoices: BillingInvoice[] = []
  private listeners: Set<() => void> = new Set()

  // Agregar facturas
  addInvoices(newInvoices: BillingInvoice[]) {
    this.invoices = [...this.invoices, ...newInvoices]
    this.notifyListeners()
  }

  // Obtener todas las facturas
  getInvoices(): BillingInvoice[] {
    return [...this.invoices]
  }

  // Limpiar facturas
  clearInvoices() {
    this.invoices = []
    this.notifyListeners()
  }

  // Suscribirse a cambios
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }
}

export const billingStore = new BillingStore()
