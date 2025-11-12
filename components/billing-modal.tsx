"use client"

import { useState, useEffect } from "react"
import { X, FileText, Calendar, Hash, DollarSign } from "lucide-react"
import { billingStore } from "@/lib/billing-store"
import { parseBillingFile } from "@/lib/billing-data-parser"
import type { BillingInvoice } from "@/lib/billing-data-parser"
import { toast } from "sonner"
import { useModalScrollLock } from "@/hooks/useModalScrollLock"

interface BillingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setInvoices(billingStore.getInvoices())
    const unsubscribe = billingStore.subscribe(() => {
      setInvoices(billingStore.getInvoices())
    })
    return unsubscribe
  }, [])

  // Bloquear scroll del body cuando el modal está abierto
  useModalScrollLock(isOpen)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const data = await parseBillingFile(file)
      billingStore.addInvoices(data.invoices)
      toast.success(`${data.invoiceCount} facturas importadas correctamente`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el archivo')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Facturas</h2>
              <p className="text-sm text-muted-foreground">
                {invoices.length} factura{invoices.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay facturas</h3>
              <p className="text-muted-foreground mb-6">
                Importa un archivo JSON con tus facturas de MercadoPago
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                <FileText className="w-4 h-4" />
                {isLoading ? 'Procesando...' : 'Importar facturas'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              {/* Import button when there are invoices */}
              <div className="mb-4">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <FileText className="w-4 h-4" />
                  {isLoading ? 'Procesando...' : 'Importar más facturas'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Invoice cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoices.map((invoice, index) => (
                  <div
                    key={`${invoice.referenceNumber}-${index}`}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">
                          {invoice.billingConcept}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(invoice.billingDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {formatCurrency(invoice.total)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">{invoice.referenceNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                          {invoice.billingType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {invoices.length > 0 && (
          <div className="border-t border-border p-4 flex justify-between items-center">
            <button
              onClick={() => {
                billingStore.clearInvoices()
                toast.success('Facturas eliminadas')
              }}
              className="text-sm text-destructive hover:underline"
            >
              Limpiar todas
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
