import { useEffect } from 'react'

/**
 * Hook para bloquear el scroll del body cuando un modal está abierto
 * Previene layout shift calculando y compensando el ancho del scrollbar
 */
export function useModalScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Calcular ancho del scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Guardar en variable CSS
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
      
      // Agregar clase que bloquea scroll y compensa con padding
      document.body.classList.add('modal-open')
    } else {
      // Remover clase
      document.body.classList.remove('modal-open')
      
      // Limpiar variable CSS
      document.documentElement.style.removeProperty('--scrollbar-width')
    }
    
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.style.removeProperty('--scrollbar-width')
    }
  }, [isOpen])
}
