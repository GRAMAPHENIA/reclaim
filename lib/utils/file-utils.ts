/**
 * Utilidades para manejo de archivos
 * Responsabilidad: Funciones auxiliares para operaciones con archivos
 */

/**
 * Formatos de archivo soportados
 */
export const SUPPORTED_FILE_EXTENSIONS = ['.csv', '.json', '.zip'] as const
export type SupportedFileExtension = typeof SUPPORTED_FILE_EXTENSIONS[number]

/**
 * Tipos MIME soportados
 */
export const SUPPORTED_MIME_TYPES = {
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip'
} as const

/**
 * Valida si un archivo tiene una extensión soportada
 */
export function isValidFileExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase()
  return SUPPORTED_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext))
}

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
}

/**
 * Valida si un archivo es de tipo CSV
 */
export function isCSVFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.csv')
}

/**
 * Valida si un archivo es de tipo JSON
 */
export function isJSONFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.json')
}

/**
 * Valida si un archivo es de tipo ZIP
 */
export function isZIPFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.zip')
}

/**
 * Formatea el tamaño de un archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Valida el tamaño máximo de un archivo (en bytes)
 */
export function isFileSizeValid(file: File, maxSizeInMB: number = 50): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * Obtiene información resumida de un archivo
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    type: file.type,
    extension: getFileExtension(file.name),
    isValid: isValidFileExtension(file.name),
    lastModified: new Date(file.lastModified)
  }
}

/**
 * Filtra archivos válidos de una lista
 */
export function filterValidFiles(files: File[]): File[] {
  return files.filter(file => isValidFileExtension(file.name))
}

/**
 * Agrupa archivos por extensión
 */
export function groupFilesByExtension(files: File[]): Record<string, File[]> {
  return files.reduce((acc, file) => {
    const ext = getFileExtension(file.name)
    if (!acc[ext]) {
      acc[ext] = []
    }
    acc[ext].push(file)
    return acc
  }, {} as Record<string, File[]>)
}
