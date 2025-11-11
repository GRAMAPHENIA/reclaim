// Store para gestionar rendimientos
import type { YieldEntry } from './yields-data-parser'

class YieldsStore {
  private yields: YieldEntry[] = []
  private listeners: Set<() => void> = new Set()

  // Agregar rendimientos
  addYields(newYields: YieldEntry[]) {
    this.yields = [...this.yields, ...newYields]
    this.notifyListeners()
  }

  // Obtener todos los rendimientos
  getYields(): YieldEntry[] {
    return [...this.yields]
  }

  // Limpiar rendimientos
  clearYields() {
    this.yields = []
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

export const yieldsStore = new YieldsStore()
