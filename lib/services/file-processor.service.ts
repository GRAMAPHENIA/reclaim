import { parseFinancialFile } from "@/lib/financial-data-parser"
import { financialStore } from "@/lib/financial-store"
import JSZip from "jszip"

/**
 * Servicio para procesamiento de archivos financieros
 * Responsabilidad: Manejar la lógica de procesamiento de archivos
 */
export class FileProcessorService {
  /**
   * Procesa un archivo financiero individual
   */
  static async processFile(file: File, fileName?: string): Promise<number> {
    const displayName = fileName || file.name
    console.log(`Procesando archivo financiero: ${displayName}`)

    const processedData = await parseFinancialFile(file)
    console.log(`Archivo procesado: ${processedData.transactions.length} transacciones`)

    financialStore.addFinancialData(processedData)

    return processedData.transactions.length
  }

  /**
   * Procesa múltiples archivos
   */
  static async processFiles(files: File[]): Promise<number> {
    let totalProcessed = 0

    for (const file of files) {
      if (this.isValidFileType(file)) {
        try {
          const processed = await this.processFile(file)
          totalProcessed += processed
        } catch (error) {
          console.error(`Error procesando ${file.name}:`, error)
          throw error
        }
      }
    }

    return totalProcessed
  }

  /**
   * Procesa un archivo ZIP
   */
  static async processZipFile(file: File): Promise<number> {
    console.log(`Procesando archivo ZIP: ${file.name}`)
    
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(file)
    
    let totalProcessed = 0
    const jsonFiles = Object.keys(zipContent.files).filter(
      name => name.endsWith('.json') && !zipContent.files[name].dir
    )
    
    console.log(`Encontrados ${jsonFiles.length} archivos JSON en el ZIP`)
    
    for (const fileName of jsonFiles) {
      try {
        const fileContent = await zipContent.files[fileName].async('text')
        const blob = new Blob([fileContent], { type: 'application/json' })
        const jsonFile = new File([blob], fileName, { type: 'application/json' })
        
        const processed = await this.processFile(jsonFile, fileName)
        totalProcessed += processed
      } catch (error) {
        console.error(`Error procesando ${fileName} del ZIP:`, error)
      }
    }
    
    return totalProcessed
  }

  /**
   * Procesa un directorio (carpeta)
   */
  static async processDirectory(dirEntry: FileSystemDirectoryEntry, path: string = ''): Promise<number> {
    const currentPath = path ? `${path}/${dirEntry.name}` : dirEntry.name
    console.log(`Procesando carpeta: ${currentPath}`)
    
    let totalProcessed = 0
    
    const entries = await this.readDirectory(dirEntry)
    totalProcessed = await this.processEntries(entries, currentPath)
    
    console.log(`Carpeta ${currentPath} procesada: ${totalProcessed} transacciones totales`)
    return totalProcessed
  }

  /**
   * Lee un directorio y retorna sus entradas
   */
  private static readDirectory(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
      const reader = entry.createReader()
      const allEntries: FileSystemEntry[] = []
      
      const readBatch = () => {
        reader.readEntries((entries) => {
          if (entries.length === 0) {
            resolve(allEntries)
          } else {
            allEntries.push(...entries)
            readBatch()
          }
        }, reject)
      }
      
      readBatch()
    })
  }

  /**
   * Lee un archivo desde FileSystemFileEntry
   */
  private static readFile(fileEntry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject)
    })
  }

  /**
   * Procesa entradas de un directorio recursivamente
   */
  private static async processEntries(entries: FileSystemEntry[], currentPath: string): Promise<number> {
    console.log(`Encontradas ${entries.length} entradas en ${currentPath}`)
    let totalProcessed = 0
    
    for (const entry of entries) {
      const entryPath = `${currentPath}/${entry.name}`
      
      if (entry.isFile && this.isValidFileName(entry.name)) {
        try {
          console.log(`Procesando archivo: ${entryPath}`)
          const file = await this.readFile(entry as FileSystemFileEntry)
          const processed = await this.processFile(file, entryPath)
          totalProcessed += processed
        } catch (error) {
          console.error(`Error procesando ${entryPath}:`, error)
        }
      } else if (entry.isDirectory) {
        try {
          console.log(`Entrando en subcarpeta: ${entryPath}`)
          const subEntries = await this.readDirectory(entry as FileSystemDirectoryEntry)
          const subProcessed = await this.processEntries(subEntries, entryPath)
          totalProcessed += subProcessed
        } catch (error) {
          console.error(`Error procesando subcarpeta ${entryPath}:`, error)
        }
      }
    }
    
    return totalProcessed
  }

  /**
   * Valida si un archivo tiene un tipo válido
   */
  static isValidFileType(file: File): boolean {
    const validExtensions = ['.csv', '.json', '.zip']
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  }

  /**
   * Valida si un nombre de archivo es válido
   */
  static isValidFileName(fileName: string): boolean {
    const validExtensions = ['.csv', '.json', '.zip']
    return validExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  /**
   * Obtiene la extensión de un archivo
   */
  static getFileExtension(fileName: string): string {
    return fileName.toLowerCase().split('.').pop() || ''
  }
}
