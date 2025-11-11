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
          className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1">
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {transaction.date.toLocaleDateString('es-ES')} • {transaction.category}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${
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
