import { BaseParser } from "./BaseParser"
import { parseMercadoPagoCSV, parseMercadoPagoJSON, processFinancialData } from "@/lib/financial-data-parser"
import type { ProcessedFinancialData } from "@/lib/financial-data-parser"
import type { ParserConfig } from "@/lib/interfaces/IDataParser"
import { FileParseError } from "@/lib/errors/FinancialError"

/**
 * Parser específico para archivos de MercadoPago
 * Responsabilidad: Parsear archivos CSV y JSON de MercadoPago
 */
export class MercadoPagoParser extends BaseParser {
  readonly name = 'MercadoPagoParser'
  readonly supportedFormats = ['csv', 'json']

  constructor(config?: ParserConfig) {
    super(config)
  }

  /**
   * Parsea un archivo de MercadoPago
   */
  async parse(file: File): Promise<ProcessedFinancialData> {
    this.log('Iniciando parseo', { fileName: file.name, size: file.size })

    // Validar archivo
    this.validateFile(file)

    const extension = this.getFileExtension(file.name)

    try {
      if (extension === 'csv') {
        return await this.parseCSV(file)
      } else if (extension === 'json') {
        return await this.parseJSON(file)
      } else {
        throw new FileParseError(
          `Formato no soportado: ${extension}`,
          file.name
        )
      }
    } catch (error) {
      this.logError('Error en parseo', error)
      throw error
    }
  }

  /**
   * Parsea un archivo CSV de MercadoPago
   */
  private async parseCSV(file: File): Promise<ProcessedFinancialData> {
    this.log('Parseando CSV')

    const content = await this.readFileAsText(file)
    const transactions = parseMercadoPagoCSV(content)

    if (transactions.length === 0) {
      throw new FileParseError(
        'No se encontraron transacciones válidas en el archivo CSV',
        file.name
      )
    }

    this.log('CSV parseado exitosamente', { transacciones: transactions.length })

    return processFinancialData(transactions)
  }

  /**
   * Parsea un archivo JSON de MercadoPago
   */
  private async parseJSON(file: File): Promise<ProcessedFinancialData> {
    this.log('Parseando JSON')

    const content = await this.readFileAsText(file)
    
    let jsonData: any
    try {
      jsonData = JSON.parse(content)
    } catch (error) {
      throw new FileParseError(
        'El archivo JSON no es válido',
        file.name,
        { parseError: error }
      )
    }

    if (!Array.isArray(jsonData)) {
      throw new FileParseError(
        'El archivo JSON debe contener un array de transacciones',
        file.name
      )
    }

    const transactions = parseMercadoPagoJSON(jsonData)

    if (transactions.length === 0) {
      throw new FileParseError(
        'No se encontraron transacciones válidas en el archivo JSON',
        file.name
      )
    }

    this.log('JSON parseado exitosamente', { transacciones: transactions.length })

    return processFinancialData(transactions)
  }

  /**
   * Valida el contenido específico de MercadoPago
   */
  validate(content: string): boolean {
    if (!super.validate(content)) {
      return false
    }

    // Validaciones adicionales específicas de MercadoPago
    // Por ejemplo, verificar que tenga headers esperados o estructura JSON
    return true
  }
}
