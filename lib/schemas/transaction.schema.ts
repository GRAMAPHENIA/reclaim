import { z } from "zod"

/**
 * Esquemas de validación con Zod
 * Responsabilidad: Validar datos de transacciones financieras
 */

/**
 * Tipos de transacción válidos
 */
export const TransactionTypeSchema = z.enum(['credit', 'debit'])

/**
 * Estados de transacción válidos
 */
export const TransactionStatusSchema = z.enum(['approved', 'pending', 'rejected'])

/**
 * Esquema para una transacción financiera
 */
export const FinancialTransactionSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
    invalid_type_error: "La fecha debe ser un objeto Date válido"
  }),
  description: z.string({
    required_error: "La descripción es requerida"
  }).min(1, "La descripción no puede estar vacía"),
  amount: z.number({
    required_error: "El monto es requerido",
    invalid_type_error: "El monto debe ser un número"
  }).positive("El monto debe ser positivo"),
  type: TransactionTypeSchema,
  category: z.string().min(1, "La categoría no puede estar vacía"),
  paymentMethod: z.string().min(1, "El método de pago no puede estar vacío"),
  status: TransactionStatusSchema,
  reference: z.string(),
  rawData: z.any().optional()
})

/**
 * Esquema para un array de transacciones
 */
export const FinancialTransactionsArraySchema = z.array(FinancialTransactionSchema)

/**
 * Esquema para el resumen financiero
 */
export const FinancialSummarySchema = z.object({
  totalCredits: z.number().nonnegative(),
  totalDebits: z.number().nonnegative(),
  netBalance: z.number(),
  transactionCount: z.number().int().nonnegative(),
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  topCategories: z.array(z.object({
    category: z.string(),
    amount: z.number().nonnegative(),
    count: z.number().int().nonnegative()
  }))
})

/**
 * Esquema para datos financieros procesados
 */
export const ProcessedFinancialDataSchema = z.object({
  transactions: FinancialTransactionsArraySchema,
  summary: FinancialSummarySchema
})

/**
 * Tipos inferidos de los esquemas
 */
export type TransactionType = z.infer<typeof TransactionTypeSchema>
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>
export type ValidatedFinancialTransaction = z.infer<typeof FinancialTransactionSchema>
export type ValidatedFinancialSummary = z.infer<typeof FinancialSummarySchema>
export type ValidatedProcessedFinancialData = z.infer<typeof ProcessedFinancialDataSchema>

/**
 * Valida una transacción financiera
 */
export function validateTransaction(data: unknown): ValidatedFinancialTransaction {
  return FinancialTransactionSchema.parse(data)
}

/**
 * Valida un array de transacciones
 */
export function validateTransactions(data: unknown): ValidatedFinancialTransaction[] {
  return FinancialTransactionsArraySchema.parse(data)
}

/**
 * Valida datos financieros procesados
 */
export function validateProcessedData(data: unknown): ValidatedProcessedFinancialData {
  return ProcessedFinancialDataSchema.parse(data)
}

/**
 * Valida una transacción de forma segura (sin lanzar error)
 */
export function safeValidateTransaction(data: unknown) {
  return FinancialTransactionSchema.safeParse(data)
}

/**
 * Valida transacciones de forma segura (sin lanzar error)
 */
export function safeValidateTransactions(data: unknown) {
  return FinancialTransactionsArraySchema.safeParse(data)
}
