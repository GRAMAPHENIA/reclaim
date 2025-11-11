import type { IDataParser, ParseResult, ParserConfig } from "@/lib/interfaces/IDataParser"
import type { ProcessedFinancialData } from "@/lib/financial-data-parser"
import { FileParseError, EmptyFileError, FileSizeError } from "@/lib/errors/FinancialError"

/**
 * Parser base abstracto
 * Responsabilidad: Implementación base para todos los parsers
 */
export abstract class BaseParser implements IDataParser {
  abstract readonly name: string
  abstract readonly supportedFormats: string[]

  protected config: ParserConfig

  constructor(config: ParserConfig = {}) {
    this.config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB por defecto
      timeout: 30000, // 30 segundos
      strictMode: false,
      encoding: 'utf-8',
      ...config
    }
  }

  /**
   * Verifica si el parser puede procesar el archivo
   */
  canParse(file: File): boolean {
    const extension = this.getFileExtension(file.name)
    return this.supportedFormats.includes(extension)
  }

  /**
   * Parsea un archivo (método abstracto)
   */
  abstract parse(file: File): Promise<ProcessedFinancialData>

  /**
   * Parsea con información detallada del resultado
   */
  async parseWithDetails(file: File): Promise<ParseResult> {
    const startTime = Date.now()
    
    try {
      // Validaciones previas
      this.validateFile(file)

      // Parsear archivo
      const data = await this.parse(file)
      const parseTime = Date.now() - startTime

      return {
        success: true,
        data,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          parseTime,
          transactionsFound: data.transactions.length
        }
      }
    } catch (error) {
      const parseTime = Date.now() - startTime

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Error desconocido'),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          parseTime,
          transactionsFound: 0
        }
      }
    }
  }

  /**
   * Valida el contenido antes de parsear
   */
  validate(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return false
    }
    return true
  }

  /**
   * Valida el archivo antes de procesarlo
   */
  protected validateFile(file: File): void {
    // Validar que el archivo existe
    if (!file) {
      throw new FileParseError('Archivo no válido', 'unknown')
    }

    // Validar tamaño
    if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
      throw new FileSizeError(
        file.name,
        file.size,
        this.config.maxFileSize
      )
    }

    // Validar que no está vacío
    if (file.size === 0) {
      throw new EmptyFileError(file.name)
    }

    // Validar formato
    if (!this.canParse(file)) {
      throw new FileParseError(
        `Formato no soportado por ${this.name}`,
        file.name
      )
    }
  }

  /**
   * Lee el contenido del archivo como texto
   */
  protected async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const content = e.target?.result as string
        if (!this.validate(content)) {
          reject(new EmptyFileError(file.name))
        } else {
          resolve(content)
        }
      }

      reader.onerror = () => {
        reject(new FileParseError('Error leyendo el archivo', file.name))
      }

      reader.readAsText(file, this.config.encoding)
    })
  }

  /**
   * Lee el contenido del archivo como ArrayBuffer
   */
  protected async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer
        resolve(content)
      }

      reader.onerror = () => {
        reject(new FileParseError('Error leyendo el archivo', file.name))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Obtiene la extensión del archivo
   */
  protected getFileExtension(fileName: string): string {
    return fileName.toLowerCase().split('.').pop() || ''
  }

  /**
   * Registra información de debug
   */
  protected log(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.name}] ${message}`, data || '')
    }
  }

  /**
   * Registra errores
   */
  protected logError(message: string, error?: any): void {
    console.error(`[${this.name}] ${message}`, error || '')
  }
}
