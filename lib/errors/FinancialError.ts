/**
 * Errores personalizados para la aplicación financiera
 * Responsabilidad: Definir tipos de errores específicos del dominio
 */

/**
 * Error base para errores financieros
 */
export class FinancialError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'FinancialError'
    Object.setPrototypeOf(this, FinancialError.prototype)
  }
}

/**
 * Error al parsear archivos financieros
 */
export class FileParseError extends FinancialError {
  constructor(
    message: string,
    public fileName: string,
    details?: Record<string, any>
  ) {
    super(message, 'FILE_PARSE_ERROR', { fileName, ...details })
    this.name = 'FileParseError'
    Object.setPrototypeOf(this, FileParseError.prototype)
  }
}

/**
 * Error de validación de datos
 */
export class ValidationError extends FinancialError {
  constructor(
    message: string,
    public validationErrors: Array<{ field: string; message: string }>,
    details?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', { validationErrors, ...details })
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Error al procesar transacciones
 */
export class TransactionProcessingError extends FinancialError {
  constructor(
    message: string,
    public transactionData?: any,
    details?: Record<string, any>
  ) {
    super(message, 'TRANSACTION_PROCESSING_ERROR', { transactionData, ...details })
    this.name = 'TransactionProcessingError'
    Object.setPrototypeOf(this, TransactionProcessingError.prototype)
  }
}

/**
 * Error de formato de archivo no soportado
 */
export class UnsupportedFileFormatError extends FinancialError {
  constructor(
    public fileName: string,
    public fileExtension: string,
    details?: Record<string, any>
  ) {
    super(
      `Formato de archivo no soportado: ${fileExtension}`,
      'UNSUPPORTED_FILE_FORMAT',
      { fileName, fileExtension, ...details }
    )
    this.name = 'UnsupportedFileFormatError'
    Object.setPrototypeOf(this, UnsupportedFileFormatError.prototype)
  }
}

/**
 * Error de archivo vacío
 */
export class EmptyFileError extends FinancialError {
  constructor(
    public fileName: string,
    details?: Record<string, any>
  ) {
    super(
      `El archivo está vacío: ${fileName}`,
      'EMPTY_FILE',
      { fileName, ...details }
    )
    this.name = 'EmptyFileError'
    Object.setPrototypeOf(this, EmptyFileError.prototype)
  }
}

/**
 * Error de archivo muy grande
 */
export class FileSizeError extends FinancialError {
  constructor(
    public fileName: string,
    public fileSize: number,
    public maxSize: number,
    details?: Record<string, any>
  ) {
    super(
      `El archivo es muy grande: ${fileName} (${fileSize} bytes, máximo ${maxSize} bytes)`,
      'FILE_SIZE_ERROR',
      { fileName, fileSize, maxSize, ...details }
    )
    this.name = 'FileSizeError'
    Object.setPrototypeOf(this, FileSizeError.prototype)
  }
}

/**
 * Error al exportar datos
 */
export class ExportError extends FinancialError {
  constructor(
    message: string,
    public format: string,
    details?: Record<string, any>
  ) {
    super(message, 'EXPORT_ERROR', { format, ...details })
    this.name = 'ExportError'
    Object.setPrototypeOf(this, ExportError.prototype)
  }
}

/**
 * Verifica si un error es un FinancialError
 */
export function isFinancialError(error: unknown): error is FinancialError {
  return error instanceof FinancialError
}

/**
 * Obtiene un mensaje de error amigable para el usuario
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isFinancialError(error)) {
    switch (error.code) {
      case 'FILE_PARSE_ERROR':
        return `No se pudo leer el archivo. Verifica que sea un archivo válido de MercadoPago.`
      case 'VALIDATION_ERROR':
        return `Los datos del archivo no son válidos. Verifica el formato.`
      case 'UNSUPPORTED_FILE_FORMAT':
        return `Formato de archivo no soportado. Usa archivos CSV, JSON o ZIP.`
      case 'EMPTY_FILE':
        return `El archivo está vacío. Selecciona un archivo con datos.`
      case 'FILE_SIZE_ERROR':
        return `El archivo es muy grande. El tamaño máximo es 50MB.`
      case 'EXPORT_ERROR':
        return `No se pudo exportar los datos. Intenta nuevamente.`
      default:
        return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}

/**
 * Registra un error en la consola con detalles
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : '[Error]'
  
  if (isFinancialError(error)) {
    console.error(`${prefix} ${error.name}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    })
  } else if (error instanceof Error) {
    console.error(`${prefix} ${error.name}:`, {
      message: error.message,
      stack: error.stack
    })
  } else {
    console.error(`${prefix} Unknown error:`, error)
  }
}
