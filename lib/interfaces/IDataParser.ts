import type { ProcessedFinancialData, FinancialTransaction } from "@/lib/financial-data-parser"

/**
 * Interfaces para parsers de datos financieros
 * Responsabilidad: Definir contratos para diferentes parsers
 */

/**
 * Resultado de parseo con información adicional
 */
export interface ParseResult {
  success: boolean
  data?: ProcessedFinancialData
  error?: Error
  warnings?: string[]
  metadata?: {
    fileName: string
    fileSize: number
    parseTime: number
    transactionsFound: number
  }
}

/**
 * Interface base para parsers de datos financieros
 */
export interface IDataParser {
  /**
   * Nombre del parser
   */
  readonly name: string

  /**
   * Formatos soportados por el parser
   */
  readonly supportedFormats: string[]

  /**
   * Verifica si el parser puede procesar el archivo
   */
  canParse(file: File): boolean

  /**
   * Parsea un archivo y retorna datos procesados
   */
  parse(file: File): Promise<ProcessedFinancialData>

  /**
   * Parsea con información detallada del resultado
   */
  parseWithDetails(file: File): Promise<ParseResult>

  /**
   * Valida el contenido antes de parsear
   */
  validate(content: string): boolean
}

/**
 * Interface para parsers de CSV
 */
export interface ICSVParser extends IDataParser {
  /**
   * Delimitador usado en el CSV
   */
  readonly delimiter: string

  /**
   * Indica si el CSV tiene headers
   */
  readonly hasHeaders: boolean

  /**
   * Parsea una línea del CSV
   */
  parseLine(line: string): FinancialTransaction | null
}

/**
 * Interface para parsers de JSON
 */
export interface IJSONParser extends IDataParser {
  /**
   * Esquema esperado del JSON
   */
  readonly schema: string

  /**
   * Parsea un objeto JSON
   */
  parseObject(obj: any): FinancialTransaction | null

  /**
   * Valida estructura del JSON
   */
  validateStructure(obj: any): boolean
}

/**
 * Interface para parsers de ZIP
 */
export interface IZIPParser extends IDataParser {
  /**
   * Parsers internos para archivos dentro del ZIP
   */
  readonly innerParsers: IDataParser[]

  /**
   * Extrae archivos del ZIP
   */
  extractFiles(file: File): Promise<File[]>

  /**
   * Procesa múltiples archivos del ZIP
   */
  parseMultiple(files: File[]): Promise<ProcessedFinancialData>
}

/**
 * Factory para crear parsers
 */
export interface IParserFactory {
  /**
   * Crea un parser apropiado para el archivo
   */
  createParser(file: File): IDataParser | null

  /**
   * Registra un nuevo parser
   */
  registerParser(parser: IDataParser): void

  /**
   * Obtiene todos los parsers registrados
   */
  getParsers(): IDataParser[]
}

/**
 * Configuración de parser
 */
export interface ParserConfig {
  /**
   * Tamaño máximo de archivo en bytes
   */
  maxFileSize?: number

  /**
   * Timeout para parseo en ms
   */
  timeout?: number

  /**
   * Modo estricto de validación
   */
  strictMode?: boolean

  /**
   * Encoding del archivo
   */
  encoding?: string
}
