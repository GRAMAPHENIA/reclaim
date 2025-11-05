// Simple client-side state management for health data

import type { HealthMetric } from "./health-data-parser"

type Listener = () => void

class HealthStore {
  private metrics: HealthMetric[] = []
  private listeners: Set<Listener> = new Set()

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  addMetrics(newMetrics: HealthMetric[]) {
    this.metrics = [...this.metrics, ...newMetrics]
    this.notify()
  }

  getMetrics() {
    return [...this.metrics]
  }

  clearMetrics() {
    this.metrics = []
    this.notify()
  }

  getMetricsInRange(startDate: Date, endDate: Date) {
    return this.metrics.filter((m) => m.date >= startDate && m.date <= endDate)
  }
}

export const healthStore = new HealthStore()
