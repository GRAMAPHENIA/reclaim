/**
 * Componente de paginación de transacciones
 * Responsabilidad: Controles de paginación
 */
interface TransactionsPaginationProps {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onGoToPage: (page: number) => void
  onGoToFirstPage: () => void
  onGoToLastPage: () => void
  onGoToNextPage: () => void
  onGoToPreviousPage: () => void
}

export function TransactionsPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  hasNextPage,
  hasPreviousPage,
  onGoToPage,
  onGoToFirstPage,
  onGoToLastPage,
  onGoToNextPage,
  onGoToPreviousPage
}: TransactionsPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-border">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {/* Ir al primero */}
        <button
          onClick={onGoToFirstPage}
          disabled={!hasPreviousPage}
          className="px-2 py-1 text-xs sm:text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          ««
        </button>

        {/* Anterior */}
        <button
          onClick={onGoToPreviousPage}
          disabled={!hasPreviousPage}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">‹</span>
        </button>

        {/* Números de página */}
        <div className="hidden sm:flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
            if (pageNum > totalPages) return null
            return (
              <button
                key={pageNum}
                onClick={() => onGoToPage(pageNum)}
                className={`px-3 py-1 text-xs sm:text-sm border rounded transition-colors ${
                  pageNum === currentPage
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Indicador de página en mobile */}
        <div className="sm:hidden px-3 py-1 text-xs border border-border rounded bg-muted">
          {currentPage} / {totalPages}
        </div>

        {/* Siguiente */}
        <button
          onClick={onGoToNextPage}
          disabled={!hasNextPage}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <span className="sm:hidden">›</span>
        </button>

        {/* Ir al último */}
        <button
          onClick={onGoToLastPage}
          disabled={!hasNextPage}
          className="px-2 py-1 text-xs sm:text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          »»
        </button>
      </div>
    </div>
  )
}
