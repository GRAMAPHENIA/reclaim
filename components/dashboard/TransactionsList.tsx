import type { FinancialTransaction } from "@/lib/financial-data-parser"

/**
 * Componente de lista de transacciones
 * Responsabilidad: Mostrar lista de transacciones
 */
interface TransactionsListProps {
  transactions: FinancialTransaction[]
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => (
        <div 
          key={`${transaction.reference}-${index}`} 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-border rounded hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {transaction.date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric'
              })} • {transaction.category}
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 text-right">
            <p className={`font-semibold text-base sm:text-lg ${
              transaction.type === 'credit' 
                ? 'text-green-600 dark:text-green-500' 
                : 'text-red-600 dark:text-red-500'
            }`}>
              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-muted-foreground">{transaction.paymentMethod}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
